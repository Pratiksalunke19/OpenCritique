use ic_cdk::api::caller;
use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::HashMap;
use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
struct Artwork {
    id: u64,
    title: String,
    description: String,
    image_url: String,
    author: Principal,
    critiques: Vec<Critique>,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
struct Critique {
    id: u64,
    critic: Principal,
    text: String,
    upvotes: u64,
}

thread_local! {
    static ARTWORKS: RefCell<Vec<Artwork>> = RefCell::new(vec![]);
    static POINTS: RefCell<HashMap<Principal, u64>> = RefCell::new(HashMap::new());
    static ART_ID_COUNTER: RefCell<u64> = RefCell::new(0);
}

#[update]
fn upload_art(title: String, description: String, image_url: String) {
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
                critic,
                text,
                upvotes: 0,
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
    ARTWORKS.with(|arts| {
        let mut artworks = arts.borrow_mut();
        if let Some(art) = artworks.iter_mut().find(|a| a.id == art_id) {
            if let Some(cri) = art.critiques.iter_mut().find(|c| c.id == critique_id) {
                cri.upvotes += 1;
                POINTS.with(|pts| {
                    let mut points = pts.borrow_mut();
                    *points.entry(cri.critic).or_insert(0) += 1;
                });
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
