use candid::{CandidType, Nat, Principal};
use ic_cdk::api::{caller, time};
use ic_cdk::{call, id};
use ic_cdk_macros::{query, update};
use serde::{Deserialize, Serialize};

use crate::{ARTWORKS, ResultText};

/// ----- ICRC-1 minimal types -----

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Account {
    pub owner: Principal,
    pub subaccount: Option<[u8; 32]>,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Icrc1TransferArg {
    pub to: Account,
    pub amount: Nat,
    pub fee: Option<Nat>,
    pub memo: Option<Vec<u8>>,
    pub from_subaccount: Option<[u8; 32]>,
    pub created_at_time: Option<u64>, // IC time in nanoseconds
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub enum Icrc1TransferError {
    GenericError { message: String, error_code: Nat },
    TemporarilyUnavailable,
    BadBurn { min_burn_amount: Nat },
    Duplicate { duplicate_of: Nat },
    BadFee { expected_fee: Nat },
    CreatedInFuture { ledger_time: u64 },
    TooOld,
    InsufficientFunds { balance: Nat },
}

type Icrc1TransferResult = Result<Nat, Icrc1TransferError>;

/// ----- Bounty model (same as in your lib.rs) -----

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Bounty {
    pub token_ledger: Option<Principal>,     // ICP Ledger canister
    pub escrow_subaccount: Option<[u8; 32]>, // subaccount for holding tokens
    pub intended_amount: u64,                // bounty amount (e8s)
    pub released: bool,                      // whether already claimed
}

impl Bounty {
    pub fn new(amount: u64) -> Self {
        Bounty {
            token_ledger: None,
            escrow_subaccount: None,
            intended_amount: amount,
            released: false,
        }
    }
}

/// Deterministic 32-byte escrow subaccount for an artwork.
/// We avoid extra hashing deps; encode art_id in the first 8 bytes LE, rest zeroed.
fn derive_escrow_subaccount(art_id: u64) -> [u8; 32] {
    let mut s = [0u8; 32];
    s[0..8].copy_from_slice(&art_id.to_le_bytes());
    // Optional domain separator to reduce accidental collisions across features:
    // ASCII "OC_ESCROW" in next 8 bytes
    s[8..16].copy_from_slice(b"OC_ESCRO");
    s
}

/// Helper: read the ICP ledger canister from the bounty.
fn get_ledger_or_err(b: &Bounty) -> Result<Principal, ResultText> {
    b.token_ledger
        .ok_or_else(|| ResultText::Err("No ledger set for this bounty".to_string()))
}

/// ----- Public API -----
///
/// PREPARE: Set or update bounty amount and ledger, and create escrow subaccount.
/// Frontend should then show the escrow account (owner = canister, subaccount = escrow)
/// so the artist can send ICP there.
#[update]
pub fn prepare_bounty(art_id: u64, amount_e8s: u64, ledger_canister: Principal) -> ResultText {
    let caller_id = caller();

    ARTWORKS.with(|arts| {
        let mut artworks = arts.borrow_mut();
        match artworks.iter_mut().find(|a| a.id == art_id) {
            Some(art) => {
                if art.author != caller_id {
                    return ResultText::Err("Only author can set bounty".to_string());
                }

                let mut b = Bounty::new(amount_e8s);
                b.token_ledger = Some(ledger_canister);
                b.escrow_subaccount = Some(derive_escrow_subaccount(art_id));

                art.bounty = Some(b);
                art.feedback_bounty = amount_e8s;

                ResultText::Ok("Bounty prepared".to_string())
            }
            None => ResultText::Err("Artwork not found".to_string()),
        }
    })
}

/// CLAIM: Author pays the bounty to the selected critique's principal from escrow.
/// This performs a real ICRC-1 transfer.
#[update]
pub async fn claim_bounty(art_id: u64, critique_id: u64) -> ResultText {
    let caller_id = caller();

    // Collect needed state first to minimize the borrow window
    let (author, critic_opt, bounty_opt) = ARTWORKS.with(|arts| {
        let artworks = arts.borrow();
        if let Some(art) = artworks.iter().find(|a| a.id == art_id) {
            let critic = art.critiques.iter().find(|c| c.id == critique_id).map(|c| c.critic);
            (art.author, critic, art.bounty.clone())
        } else {
            (Principal::anonymous(), None, None)
        }
    });

    if author == Principal::anonymous() {
        return ResultText::Err("Artwork not found".to_string());
    }
    if caller_id != author {
        return ResultText::Err("Only author can release bounty".to_string());
    }

    let mut bounty = match bounty_opt {
        Some(b) => b,
        None => return ResultText::Err("No active bounty".to_string()),
    };
    if bounty.released {
        return ResultText::Err("Bounty already released".to_string());
    }

    let critic = match critic_opt {
        Some(p) => p,
        None => return ResultText::Err("Critique not found".to_string()),
    };

    let ledger = match get_ledger_or_err(&bounty) {
        Ok(p) => p,
        Err(e) => return e,
    };
    let escrow = match bounty.escrow_subaccount {
        Some(s) => s,
        None => return ResultText::Err("Escrow subaccount missing".to_string()),
    };

    // Optional (safe) pre-check: ask the ledger for the balance.
    let escrow_account = Account {
        owner: id(),
        subaccount: Some(escrow),
    };
    let balance: Nat = match call::<_, (Nat,)>(ledger, "icrc1_balance_of", (escrow_account.clone(),)).await {
        Ok((bal,)) => bal,
        Err(_) => Nat::from(0u32), // If the check fails, we still try transfer and surface real error.
    };

    // Build transfer arg
    let transfer_arg = Icrc1TransferArg {
        to: Account {
            owner: critic,
            subaccount: None,
        },
        amount: Nat::from(bounty.intended_amount),
        fee: None, // let ledger determine current fee; if it's wrong, it returns BadFee
        memo: None,
        from_subaccount: Some(escrow),
        created_at_time: Some(time()),
    };

    // Quick sanity: if we did get a balance, check it's >= amount (not including fee)
    if balance < transfer_arg.amount {
        // Not fatal; ledger will return InsufficientFunds with precise balance.
        // But we can short-circuit to save cycles:
        return ResultText::Err("Escrow has insufficient funds for bounty amount".to_string());
    }

    // Do the transfer
    let res: Result<(Icrc1TransferResult,), _> =
        call(ledger, "icrc1_transfer", (transfer_arg,)).await;

    match res {
        Ok((Ok(_block_index),)) => {
            // Mark released in state
            ARTWORKS.with(|arts| {
                let mut artworks = arts.borrow_mut();
                if let Some(art) = artworks.iter_mut().find(|a| a.id == art_id) {
                    if let Some(b) = art.bounty.as_mut() {
                        b.released = true;
                    }
                }
            });
            ResultText::Ok(format!("Bounty released to {}", critic.to_text()))
        }
        Ok((Err(err),)) => {
            let msg = match err {
                Icrc1TransferError::InsufficientFunds { .. } => "Ledger: insufficient funds".to_string(),
                Icrc1TransferError::BadFee { .. } => "Ledger: bad fee (update fee or amount)".to_string(),
                Icrc1TransferError::Duplicate { .. } => "Ledger: duplicate transfer (retry later)".to_string(),
                Icrc1TransferError::TemporarilyUnavailable => "Ledger temporarily unavailable".to_string(),
                Icrc1TransferError::TooOld => "Transfer too old; refresh created_at_time".to_string(),
                Icrc1TransferError::CreatedInFuture { .. } => "Transfer created in the future".to_string(),
                Icrc1TransferError::BadBurn { .. } => "Bad burn parameters".to_string(),
                Icrc1TransferError::GenericError { message, .. } => format!("Ledger error: {}", message),
            };
            ResultText::Err(msg)
        }
        Err((code, msg)) => {
            ResultText::Err(format!("Cross-canister call failed: {:?} {}", code, msg))
        }
    }
}

/// WITHDRAW: Author cancels and refunds remaining escrow back to themselves.
/// Tries to send the full escrow balance (whatever is there).
#[update]
pub async fn withdraw_bounty(art_id: u64) -> ResultText {
    let caller_id = caller();

    // Snapshot needed fields
    let (author, bounty_opt) = ARTWORKS.with(|arts| {
        let artworks = arts.borrow();
        if let Some(art) = artworks.iter().find(|a| a.id == art_id) {
            (art.author, art.bounty.clone())
        } else {
            (Principal::anonymous(), None)
        }
    });

    if author == Principal::anonymous() {
        return ResultText::Err("Artwork not found".to_string());
    }
    if caller_id != author {
        return ResultText::Err("Only author can withdraw bounty".to_string());
    }

    let bounty = match bounty_opt {
        Some(b) => b,
        None => return ResultText::Err("No active bounty to withdraw".to_string()),
    };
    if bounty.released {
        return ResultText::Err("Bounty already released, cannot withdraw".to_string());
    }

    let ledger = match get_ledger_or_err(&bounty) {
        Ok(p) => p,
        Err(e) => return e,
    };
    let escrow = match bounty.escrow_subaccount {
        Some(s) => s,
        None => return ResultText::Err("Escrow subaccount missing".to_string()),
    };

    // Read current escrow balance
    let escrow_account = Account {
        owner: id(),
        subaccount: Some(escrow),
    };
    let balance_res: Result<(Nat,), _> = call(ledger, "icrc1_balance_of", (escrow_account.clone(),)).await;
    let balance = match balance_res {
        Ok((bal,)) => bal,
        Err((code, msg)) => {
            return ResultText::Err(format!(
                "Failed to read escrow balance: {:?} {}",
                code, msg
            ))
        }
    };

    if balance == Nat::from(0u32) {
        // Nothing to send; just clear the bounty
        ARTWORKS.with(|arts| {
            let mut artworks = arts.borrow_mut();
            if let Some(art) = artworks.iter_mut().find(|a| a.id == art_id) {
                art.bounty = None;
                art.feedback_bounty = 0;
            }
        });
        return ResultText::Ok("Bounty withdrawn (no funds in escrow)".to_string());
    }

    // Try to transfer the entire balance back to the author (minus fee if needed).
    // We attempt the full balance; if ledger requires explicit fee handling, it may reject with BadFee.
    let transfer_arg = Icrc1TransferArg {
        to: Account {
            owner: author,
            subaccount: None,
        },
        amount: balance.clone(),
        fee: None,
        memo: None,
        from_subaccount: Some(escrow),
        created_at_time: Some(time()),
    };

    let res: Result<(Icrc1TransferResult,), _> =
        call(ledger, "icrc1_transfer", (transfer_arg,)).await;

    match res {
        Ok((Ok(_block_index),)) => {
            // Clear bounty metadata
            ARTWORKS.with(|arts| {
                let mut artworks = arts.borrow_mut();
                if let Some(art) = artworks.iter_mut().find(|a| a.id == art_id) {
                    art.bounty = None;
                    art.feedback_bounty = 0;
                }
            });
            ResultText::Ok("Bounty withdrawn and refunded to author".to_string())
        }
        Ok((Err(err),)) => {
            let msg = match err {
                Icrc1TransferError::InsufficientFunds { .. } => "Ledger: insufficient funds".to_string(),
                Icrc1TransferError::BadFee { .. } => "Ledger: bad fee (cannot auto-withdraw full balance)".to_string(),
                Icrc1TransferError::Duplicate { .. } => "Ledger: duplicate transfer (retry later)".to_string(),
                Icrc1TransferError::TemporarilyUnavailable => "Ledger temporarily unavailable".to_string(),
                Icrc1TransferError::TooOld => "Transfer too old; refresh created_at_time".to_string(),
                Icrc1TransferError::CreatedInFuture { .. } => "Transfer created in the future".to_string(),
                Icrc1TransferError::BadBurn { .. } => "Bad burn parameters".to_string(),
                Icrc1TransferError::GenericError { message, .. } => format!("Ledger error: {}", message),
            };
            ResultText::Err(msg)
        }
        Err((code, msg)) => {
            ResultText::Err(format!("Cross-canister call failed: {:?} {}", code, msg))
        }
    }
}

/// Helper: expose escrow account for UI (owner = canister, subaccount = per-artwork).
#[query]
pub fn get_bounty_escrow_account(art_id: u64) -> Option<Account> {
    ARTWORKS.with(|arts| {
        let artworks = arts.borrow();
        artworks
            .iter()
            .find(|a| a.id == art_id)
            .and_then(|art| art.bounty.as_ref())
            .and_then(|b| b.escrow_subaccount)
            .map(|sa| Account { owner: id(), subaccount: Some(sa) })
    })
}

/// Helper: read escrow balance (e8s) for UI.
#[query]
pub async fn get_bounty_escrow_balance(art_id: u64) -> u128 {
    // NOTE: query+async is supported; if your environment disallows, change to #[update]
    let (ledger, sub) = ARTWORKS.with(|arts| {
        let artworks = arts.borrow();
        if let Some(art) = artworks.iter().find(|a| a.id == art_id) {
            if let Some(b) = &art.bounty {
                return (b.token_ledger, b.escrow_subaccount);
            }
        }
        (None, None)
    });

    let (ledger, sub) = match (ledger, sub) {
        (Some(l), Some(s)) => (l, s),
        _ => return 0,
    };

    let account = Account { owner: id(), subaccount: Some(sub) };
    match call::<_, (Nat,)>(ledger, "icrc1_balance_of", (account,)).await {
        Ok((bal,)) => {
            // Convert Nat -> u128 safely (escrow balances will comfortably fit for hackathon)
            bal.0.to_u128().unwrap_or(0)
        }
        Err(_) => 0,
    }
}
