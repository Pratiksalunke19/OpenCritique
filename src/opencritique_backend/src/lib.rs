use ic_cdk::api::caller;
use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::HashMap;
use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

const ADMIN: &str = "aaaaa-aa"; 

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
struct Bounty {
    token_ledger: Option<Principal>,     // ICP Ledger canister
    escrow_subaccount: Option<[u8; 32]>, // subaccount for holding tokens
    intended_amount: u64,                // bounty set by author
    released: bool,                      // whether already claimed
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
enum ResultText {
    Ok(String),
    Err(String),
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
struct Artwork {
    id: u64,
    title: String,
    description: String,
    image_url: String,
    author: Principal,
    username: String,
    email: String,
    tags: Vec<String>,
    feedback_bounty: u64,
    license: String,
    critiques: Vec<Critique>,
    bounty: Option<Bounty>,   // <--- new field
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

// --- Update upload_art to initialize bounty as None ---
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

    let new_art = Artwork {
        id: art_id,
        title,
        description,
        image_url,
        author,
        username,
        email,
        tags,
        feedback_bounty,
        license,
        critiques: vec![],
        bounty: None, // initialize as None
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
                art_id, // <-- track this
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

// --- Minimal bounty API (state machine only; no ledger calls) ---

#[update]
fn prepare_bounty(art_id: u64, amount: u64) -> ResultText {
    let caller_id = caller();

    ARTWORKS.with(|arts| {
        let mut artworks = arts.borrow_mut();
        match artworks.iter_mut().find(|a| a.id == art_id) {
            Some(art) => {
                if art.author != caller_id {
                    return ResultText::Err("Only author can set bounty".to_string());
                }
                // set minimal bounty metadata; ledger/subaccount left None for now
                art.bounty = Some(Bounty {
                    token_ledger: None,
                    escrow_subaccount: None,
                    intended_amount: amount,
                    released: false,
                });
                art.feedback_bounty = amount; // keep number in sync if you want
                ResultText::Ok("Bounty prepared".to_string())
            }
            None => ResultText::Err("Artwork not found".to_string()),
        }
    })
}

#[update]
fn claim_bounty(art_id: u64, critique_id: u64) -> ResultText {
    let caller_id = caller();

    ARTWORKS.with(|arts| {
        let mut artworks = arts.borrow_mut();
        match artworks.iter_mut().find(|a| a.id == art_id) {
            Some(art) => {
                if art.author != caller_id {
                    return ResultText::Err("Only author can release bounty".to_string());
                }
                match &mut art.bounty {
                    Some(bounty) => {
                        if bounty.released {
                            return ResultText::Err("Bounty already released".to_string());
                        }
                        match art.critiques.iter().find(|c| c.id == critique_id) {
                            Some(cri) => {
                                bounty.released = true;
                                // NOTE: real token transfer to cri.critic must be implemented with ledger
                                return ResultText::Ok(format!(
                                    "Bounty marked released to {}",
                                    cri.critic.to_text()
                                ));
                            }
                            None => return ResultText::Err("Critique not found".to_string()),
                        }
                    }
                    None => return ResultText::Err("No active bounty".to_string()),
                }
            }
            None => ResultText::Err("Artwork not found".to_string()),
        }
    })
}

#[update]
fn withdraw_bounty(art_id: u64) -> ResultText {
    let caller_id = caller();

    ARTWORKS.with(|arts| {
        let mut artworks = arts.borrow_mut();
        match artworks.iter_mut().find(|a| a.id == art_id) {
            Some(art) => {
                if art.author != caller_id {
                    return ResultText::Err("Only author can withdraw bounty".to_string());
                }
                match &art.bounty {
                    Some(bounty) => {
                        if bounty.released {
                            return ResultText::Err("Bounty already released, cannot withdraw".to_string());
                        }
                        // remove bounty meta (actual token refund not implemented yet)
                        art.bounty = None;
                        art.feedback_bounty = 0;
                        ResultText::Ok("Bounty withdrawn".to_string())
                    }
                    None => ResultText::Err("No active bounty to withdraw".to_string()),
                }
            }
            None => ResultText::Err("Artwork not found".to_string()),
        }
    })
}
