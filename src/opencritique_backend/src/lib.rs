use ic_cdk::api::{caller, time};
// use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::HashMap;
use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
// use ic_ledger_types::{AccountIdentifier, Subaccount};

use ic_cdk::{update, query};
// use ic_cdk::export::Principal;

pub mod bounty;
pub use bounty::{Bounty, prepare_bounty, claim_bounty, withdraw_bounty, get_bounty_escrow_account_hex, get_bounty_balance, BountyResult};

const ADMIN: &str = "aaaaa-aa";

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub enum ResultText {
    Ok(String),
    Err(String),
}

/* ---------- New: Media metadata types (backwards-compatible) ---------- */

#[derive(Clone, Debug, CandidType, Deserialize, Serialize, PartialEq, Eq)]
enum MediaType {
    Image,
    Audio,
    Text,   // poetry, rap sheet, written works
    Video,
    Mixed,  // multiple files / formats for a single artwork
    Other,
}

impl Default for MediaType {
    fn default() -> Self { MediaType::Other }
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize, Default)]
struct Dimensions {
    width: u32,
    height: u32,
}

/// A flexible attachment record for any asset stored on IPFS/Pinata.
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
struct MediaFile {
    /// IPFS CID for the file (no gateway prefix needed)
    cid: String,
    /// Optional human-friendly filename
    #[serde(default)]
    name: Option<String>,
    /// Optional MIME type (e.g., "image/png", "audio/mpeg")
    #[serde(default)]
    mime: Option<String>,
    /// Role of this file relative to the artwork: "original", "thumbnail", "preview", "cover", "transcript", "lyrics", etc.
    #[serde(default)]
    role: Option<String>,
    /// Optional file size in bytes
    #[serde(default)]
    size_bytes: Option<u64>,
    /// Optional media duration in milliseconds (audio/video)
    #[serde(default)]
    duration_ms: Option<u64>,
    /// Optional pixel dimensions (images/video poster frames)
    #[serde(default)]
    dimensions: Option<Dimensions>,
}

impl MediaFile {
    fn with_role(cid: String, role: &str) -> Self {
        Self {
            cid,
            name: None,
            mime: None,
            role: Some(role.to_string()),
            size_bytes: None,
            duration_ms: None,
            dimensions: None,
        }
    }
}

/* ---------- Artwork & Critique ---------- */

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
struct Artwork {
    id: u64,
    title: String,
    description: String,

    // Treated as "primary CID or gateway URL" (back-compat name)
    image_url: String,

    author: Principal,
    username: String,
    email: String,
    tags: Vec<String>,
    feedback_bounty: u64,
    license: String,
    critiques: Vec<Critique>,

    // Bounty stays as-is
    bounty: Option<Bounty>,

    // NFT
    pub is_nft: bool,
    pub nft_price: u64,
    pub nft_buyer: String,

    /* ----- Backwards-compatible metadata fields ----- */

    /// Broad type of this artwork (your upload currently infers this)
    #[serde(default)]
    media_type: Option<String>,

    /// Primary content CID (mirrors `image_url` if that string is a CID)
    #[serde(default)]
    main_cid: Option<String>,

    /// Optional thumbnail and preview CIDs for faster/lighter UI rendering
    #[serde(default)]
    thumbnail_cid: Option<String>,
    #[serde(default)]
    preview_cid: Option<String>,

    /// Optional MIME type for the primary content (your upload currently sets this to None)
    #[serde(default)]
    mime_type: Option<String>,

    /// Optional short excerpt for text works (poetry/rap)
    #[serde(default)]
    text_excerpt: Option<String>,

    /// Optional list of additional files (cover image, transcript, stems, sheet, etc.)
    #[serde(default)]
    media_files: Vec<MediaFile>,

    /// Creation timestamp (nanoseconds since UNIX epoch)
    #[serde(default)]
    created_at_ns: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
struct Critique {
    id: u64,
    art_id: u64,
    critic: Principal,
    text: String,
    upvotes: u64,
    upvoters: Vec<Principal>,
    is_rewarded: Option<bool>,
}

thread_local! {
    static ARTWORKS: RefCell<Vec<Artwork>> = RefCell::new(vec![]);
    static POINTS: RefCell<HashMap<Principal, u64>> = RefCell::new(HashMap::new());
    static ART_ID_COUNTER: RefCell<u64> = RefCell::new(0);
}

/* ---------- Helper: infer media type from URL/CID and tags ---------- */

fn infer_media_type(primary: &str, tags: &[String]) -> MediaType {
    let s = primary.to_lowercase();
    let has = |exts: &[&str]| exts.iter().any(|e| s.ends_with(e));

    // Try based on common file extensions (works if a gateway URL is used)
    if has(&[".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"]) {
        return MediaType::Image;
    }
    if has(&[".mp3", ".wav", ".flac", ".ogg", ".aac", ".m4a"]) {
        return MediaType::Audio;
    }
    if has(&[".mp4", ".mov", ".webm", ".mkv", ".avi"]) {
        return MediaType::Video;
    }
    if has(&[".txt", ".md", ".rtf", ".pdf"]) {
        return MediaType::Text;
    }

    // Fall back to tags: "poetry", "rap", "lyrics" => Text; "music", "audio" => Audio; etc.
    let tags_lower: Vec<String> = tags.iter().map(|t| t.to_lowercase()).collect();
    let tag_has = |needle: &str| tags_lower.iter().any(|t| t.contains(needle));

    if tag_has("poetry") || tag_has("rap") || tag_has("lyrics") || tag_has("text") || tag_has("written") {
        return MediaType::Text;
    }
    if tag_has("music") || tag_has("audio") || tag_has("song") || tag_has("track") {
        return MediaType::Audio;
    }
    if tag_has("video") || tag_has("film") {
        return MediaType::Video;
    }
    if tag_has("image") || tag_has("photo") || tag_has("digital") || tag_has("art") || tag_has("illustration") {
        return MediaType::Image;
    }

    MediaType::Other
}

/* ---------- Updates & Queries (names/signatures unchanged) ---------- */

#[update]
fn upload_art(
    title: String,
    description: String,
    primary_url_or_cid: String, // now name reflects that it can be CID or URL
    username: String,
    email: String,
    tags: Vec<String>,
    feedback_bounty: u64,
    license: String,
    media_type: Option<String>, // e.g., "image", "music", "poetry", "rap", "digital"
    mime_type: Option<String>,  // e.g., "image/png", "audio/mpeg", "text/plain"
    text_excerpt: Option<String>, // optional for text-based works
    is_nft: bool,
    nft_price: u64,
    nft_buyer: String,
) {
    let author = caller();
    ic_cdk::println!("DEBUG: Caller principal: {}", author.to_text());

    let art_id = ART_ID_COUNTER.with(|counter| {
        let mut id = counter.borrow_mut();
        *id += 1;
        *id
    });

    // Detect if input is a CID
    let is_probable_cid = primary_url_or_cid.starts_with("Qm") || primary_url_or_cid.starts_with("bafy");
    let main_cid = if is_probable_cid {
        Some(primary_url_or_cid.clone())
    } else {
        None
    };

    // Prepare media files vector
    let mut media_files: Vec<MediaFile> = Vec::new();
    if let Some(cid) = main_cid.clone() {
        media_files.push(MediaFile::with_role(cid, "original"));
    }

    let mut new_art = Artwork {
        id: art_id,
        title,
        description,

        image_url: primary_url_or_cid.clone(), // keep for backwards compatibility

        author,
        username,
        email,
        tags,
        feedback_bounty,
        license,
        critiques: vec![],
        bounty: None, // start with no bounty

        is_nft,
        nft_price,
        nft_buyer,

        // Modern metadata support
        media_type,
        main_cid,
        thumbnail_cid: None,
        preview_cid: None,
        mime_type,
        text_excerpt,
        media_files,
        created_at_ns: time(),
    };

    if feedback_bounty > 0 {
        new_art.bounty = crate::bounty::set_artwork_bounty(art_id, feedback_bounty, author);
    }

    ARTWORKS.with(|arts| arts.borrow_mut().push(new_art));
}

// In lib.rs - ADD this new function
#[update]
fn upload_art_with_principal(
    title: String,
    description: String,
    primary_url_or_cid: String,
    username: String,
    email: String,
    tags: Vec<String>,
    feedback_bounty: u64,
    license: String,
    media_type: Option<String>,
    mime_type: Option<String>, 
    text_excerpt: Option<String>,
    is_nft: bool,
    nft_price: u64,
    nft_buyer: String,
    author_principal: Principal, // New parameter
) {
    let author = author_principal; // Use passed principal
    
    // Debug logging
    let caller_principal = caller();
    ic_cdk::println!("DEBUG: Caller: {}, Passed author: {}", 
        caller_principal.to_text(), author.to_text());

    let art_id = ART_ID_COUNTER.with(|counter| {
        let mut id = counter.borrow_mut();
        *id += 1;
        *id
    });
    // Detect if input is a CID
    let is_probable_cid = primary_url_or_cid.starts_with("Qm") || primary_url_or_cid.starts_with("bafy");
    let main_cid = if is_probable_cid {
        Some(primary_url_or_cid.clone())
    } else {
        None
    };

    // Prepare media files vector
    let mut media_files: Vec<MediaFile> = Vec::new();
    if let Some(cid) = main_cid.clone() {
        media_files.push(MediaFile::with_role(cid, "original"));
    }

    let mut new_art = Artwork {
        id: art_id,
        title,
        description,

        image_url: primary_url_or_cid.clone(), // keep for backwards compatibility

        author,
        username,
        email,
        tags,
        feedback_bounty,
        license,
        critiques: vec![],
        bounty: None, // start with no bounty

        is_nft,
        nft_price,
        nft_buyer,

        // Modern metadata support
        media_type,
        main_cid,
        thumbnail_cid: None,
        preview_cid: None,
        mime_type,
        text_excerpt,
        media_files,
        created_at_ns: time(),
    };

    if feedback_bounty > 0 {
        new_art.bounty = crate::bounty::set_artwork_bounty(art_id, feedback_bounty, author);
    }

    ARTWORKS.with(|arts| arts.borrow_mut().push(new_art));
}

#[update]
fn post_critique(art_id: u64, text: String) {
    let critic = caller();

    ARTWORKS.with(|arts| {
        let mut artworks = arts.borrow_mut();
        if let Some(art) = artworks.iter_mut().find(|a| a.id == art_id) {
            let critique_id = art.critiques.len() as u64;
            let new_critique = Critique {
                id: critique_id,
                art_id,
                critic,
                text,
                upvotes: 0,
                upvoters: vec![],
                is_rewarded: Some(false),
            };
            art.critiques.push(new_critique);

            POINTS.with(|pts| {
                let mut points = pts.borrow_mut();
                *points.entry(critic).or_insert(0) += 1;
            });
        }
    });
}

#[update]
fn upvote_critique(art_id: u64, critique_id: u64) {
    let voter = caller();

    ARTWORKS.with(|arts| {
        let mut artworks = arts.borrow_mut();
        if let Some(art) = artworks.iter_mut().find(|a| a.id == art_id) {
            if let Some(cri) = art.critiques.iter_mut().find(|c| c.id == critique_id) {
                if !cri.upvoters.contains(&voter) {
                    cri.upvotes += 1;
                    cri.upvoters.push(voter);

                    POINTS.with(|pts| {
                        let mut points = pts.borrow_mut();
                        *points.entry(cri.critic).or_insert(0) += 1;
                    });
                }
            }
        }
    });
}

#[query]
fn get_artworks() -> Vec<Artwork> {
    ARTWORKS.with(|arts| arts.borrow().clone())
}

#[query]
fn get_critiques(art_id: u64) -> Vec<Critique> {
    ARTWORKS.with(|arts| {
        arts.borrow()
            .iter()
            .find(|a| a.id == art_id)
            .map(|a| a.critiques.clone())
            .unwrap_or_else(Vec::new)
    })
}

#[query]
fn get_points(user: Principal) -> u64 {
    POINTS.with(|pts| *pts.borrow().get(&user).unwrap_or(&0))
}

#[query]
fn get_critiques_for_user(user: Principal) -> Vec<Critique> {
    let mut result = vec![];
    ARTWORKS.with(|arts| {
        for art in arts.borrow().iter() {
            for cri in &art.critiques {
                if cri.critic == user {
                    result.push(cri.clone());
                }
            }
        }
    });
    result
}

#[query]
fn get_critiques_sorted(art_id: u64) -> Vec<Critique> {
    let mut list = get_critiques(art_id);
    list.sort_by(|a, b| b.upvotes.cmp(&a.upvotes));
    list
}

#[update]
fn delete_artwork(art_id: u64) -> ResultText{
    let caller_id = caller();

    ARTWORKS.with(|arts| {
        let mut artworks = arts.borrow_mut();
        if let Some(index) = artworks.iter().position(|a| a.id == art_id) {
            let artwork = &artworks[index];
            let admin_principal: Principal = Principal::from_text(ADMIN).unwrap();

            if caller_id == artwork.author || caller_id == admin_principal {
                artworks.remove(index);
                ResultText::Ok(format!("Artwork {} deleted.", art_id))
            } else {
                ResultText::Err("Unauthorized: Only author or admin can delete this artwork.".to_string())
            }
        } else {
            ResultText::Err("Artwork not found.".to_string())
        }
    })
}

#[query]
fn get_my_artworks() -> Vec<Artwork> {
    let my_id = caller();
    ARTWORKS.with(|arts| {
        arts.borrow()
            .iter()
            .filter(|a| a.author == my_id)
            .cloned()
            .collect()
    })
}

/******************* NFT **************************************/

#[update]
fn set_nft_buyer(artwork_id: u64) -> Result<String, String> {
    let caller_principal = caller();
    
    ARTWORKS.with(|artworks| {
        let mut artworks = artworks.borrow_mut();
        
        match artworks.iter_mut().find(|artwork| artwork.id == artwork_id) {
            Some(artwork) => {
                if !artwork.is_nft {
                    artwork.is_nft= true;
                }
                
                if !artwork.nft_buyer.is_empty() && artwork.nft_buyer != "0" && artwork.nft_buyer != "" {
                    return Err("This NFT has already been purchased".to_string());
                }
                
                // Use caller automatically
                artwork.nft_buyer = caller_principal.to_text();
                
                Ok(format!(
                    "Successfully purchased NFT '{}' for buyer: {}", 
                    artwork.title, 
                    artwork.nft_buyer
                ))
            }
            None => Err("Artwork not found".to_string()),
        }
    })
}

#[query]
fn get_user_nfts(user_principal: Principal) -> Vec<Artwork> {
    ARTWORKS.with(|artworks| {
        let artworks = artworks.borrow();
        let user_text = user_principal.to_text();
        
        artworks
            .iter()  // Use .iter() instead of .values() for Vec
            .filter(|artwork| artwork.is_nft && artwork.nft_buyer == user_text)
            .cloned()
            .collect()
    })
}

#[query]
fn is_nft_available(artwork_id: u64) -> Result<bool, String> {
    ARTWORKS.with(|artworks| {
        let artworks = artworks.borrow();
        
        // Find artwork by id in the Vec
        match artworks.iter().find(|artwork| artwork.id == artwork_id) {
            Some(artwork) => {
                if !artwork.is_nft {
                    Err("Artwork is not an NFT".to_string())
                } else {
                    Ok(artwork.nft_buyer.is_empty() || artwork.nft_buyer == "0")
                }
            }
            None => Err("Artwork not found".to_string()),
        }
    })
}

#[update]
fn mint_nft(artwork_id: u64, nft_price: u64) -> Result<String, String> {
    let caller_principal = caller();
    
    ARTWORKS.with(|artworks| {
        let mut artworks = artworks.borrow_mut();
        
        // Find artwork by id in the Vec
        match artworks.iter_mut().find(|artwork| artwork.id == artwork_id) {
            Some(artwork) => {
                // Check if caller is the author of the artwork
                if artwork.author != caller_principal {
                    return Err("Only the artwork creator can mint it as NFT".to_string());
                }
                
                // Check if already minted as NFT
                if artwork.is_nft {
                    return Err("This artwork is already minted as an NFT".to_string());
                }
                
                // Mint as NFT
                artwork.is_nft = true;
                artwork.nft_price = nft_price;
                artwork.nft_buyer = String::new(); // Initialize as empty (available for purchase)
                
                Ok(format!(
                    "Successfully minted '{}' as NFT with price {} ICP", 
                    artwork.title, 
                    nft_price
                ))
            }
            None => Err("Artwork not found".to_string()),
        }
    })
}

/**************************************************************/

// Enable Candid export
ic_cdk::export_candid!();
