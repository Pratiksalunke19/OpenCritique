use ic_cdk::api::{caller, time};
use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::HashMap;
use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

pub mod bounty;
pub use bounty::{Bounty, prepare_bounty, claim_bounty, withdraw_bounty, get_bounty_escrow_account_hex, get_bounty_escrow_balance};

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

    // Existing field kept (now treated as "primary CID or gateway URL")
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

    /* ----- New, backwards-compatible metadata fields ----- */

    /// Broad type of this artwork (inferred if not explicitly set by future APIs)
    #[serde(default)]
    media_type: MediaType,

    /// Primary content CID (mirrors `image_url` if that string is a CID)
    #[serde(default)]
    main_cid: Option<String>,

    /// Optional thumbnail and preview CIDs for faster/lighter UI rendering
    #[serde(default)]
    thumbnail_cid: Option<String>,
    #[serde(default)]
    preview_cid: Option<String>,

    /// Optional MIME type for the primary content
    #[serde(default)]
    mime_type: Option<String>,

    /// Optional short excerpt for text works (poetry/rap), safe to render without fetching IPFS
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
    image_url: String,
    username: String,
    email: String,
    tags: Vec<String>,
    feedback_bounty: u64,
    license: String,
) {
    let author = caller();

    let art_id = ART_ID_COUNTER.with(|counter| {
        let mut id = counter.borrow_mut();
        *id += 1;
        *id
    });

    // Treat `image_url` as the "primary content locator".
    // If it's a bare CID, we'll also mirror it into `main_cid`.
    let primary = image_url.clone();
    let media_type = infer_media_type(&primary, &tags);

    // Heuristic: if the string looks like a CID (starts with "Qm" or "bafy"), store it as main_cid.
    let is_probable_cid = primary.starts_with("Qm") || primary.starts_with("bafy");
    let main_cid = if is_probable_cid { Some(primary.clone()) } else { None };

    let mut media_files: Vec<MediaFile> = Vec::new();
    if let Some(cid) = main_cid.clone() {
        media_files.push(MediaFile::with_role(cid, "original"));
    }

    let new_art = Artwork {
        id: art_id,
        title,
        description,

        image_url, // kept for backward compatibility

        author,
        username,
        email,
        tags,
        feedback_bounty,
        license,
        critiques: vec![],
        bounty: None, // initialize as None

        // New metadata (mostly inferred/defaulted)
        media_type,
        main_cid,
        thumbnail_cid: None,
        preview_cid: None,
        mime_type: None,
        text_excerpt: None,
        media_files,
        created_at_ns: time(), // nanoseconds since epoch
    };

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

// Enable Candid export
ic_cdk::export_candid!();
