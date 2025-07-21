use ic_cdk::api::caller;
use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::HashMap;
use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

const ADMIN: &str = "aaaaa-aa"; 

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
fn delete_artwork(art_id: u64) -> Result<String, String> {
    let caller_id = caller();

    ARTWORKS.with(|arts| {
        let mut artworks = arts.borrow_mut();
        if let Some(index) = artworks.iter().position(|a| a.id == art_id) {
            let artwork = &artworks[index];
            let admin_principal: Principal = Principal::from_text(ADMIN).unwrap();

            if caller_id == artwork.author || caller_id == admin_principal {
                artworks.remove(index);
                Ok(format!("Artwork {} deleted.", art_id))
            } else {
                Err("Unauthorized: Only author or admin can delete this artwork.".to_string())
            }
        } else {
            Err("Artwork not found.".to_string())
        }
    })
}
