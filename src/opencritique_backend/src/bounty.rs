// src/opencritique_backend/src/bounty.rs
// Bounty module using ic-ledger-types (fixed for types / no '?' misuse).
use candid::Principal;
use ic_cdk::api::{caller, id, time};
use ic_cdk_macros::{query, update};
use ic_ledger_types::{
    account_balance, AccountBalanceArgs, AccountIdentifier, Memo, DEFAULT_FEE, DEFAULT_SUBACCOUNT,
    Subaccount, Timestamp, TransferArgs, Tokens, transfer,
};
use serde::{Deserialize, Serialize};

use crate::{ARTWORKS, ResultText};

#[derive(Clone, Debug, candid::CandidType, Deserialize, Serialize)]
pub struct Bounty {
    pub token_ledger: Option<Principal>,
    pub escrow_subaccount: Option<[u8; 32]>,
    pub intended_amount: u64, // e8s
    pub released: bool,
}

impl Bounty {
    pub fn new(amount_e8s: u64) -> Self {
        Self {
            token_ledger: None,
            escrow_subaccount: None,
            intended_amount: amount_e8s,
            released: false,
        }
    }
}

/// Deterministic per-art escrow subaccount (32 bytes)
fn derive_escrow_subaccount(art_id: u64) -> [u8; 32] {
    let mut s = [0u8; 32];
    s[0..8].copy_from_slice(&art_id.to_le_bytes());
    s[8..16].copy_from_slice(b"OC_ESCRO");
    s
}

/// Prepare a bounty: author only. Stores ledger canister principal and escrow subaccount.
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
                ResultText::Ok("Bounty prepared — send funds to escrow account".to_string())
            }
            None => ResultText::Err("Artwork not found".to_string()),
        }
    })
}

/// Claim bounty: author triggers a ledger transfer from escrow -> critic principal.
/// Returns ResultText (string messages) — no '?' operator used so error type stays ResultText.
#[update]
    pub async fn claim_bounty(art_id: u64, critique_id: u64) -> ResultText {
    let caller_id = caller();

    // snapshot state to reduce borrow time
    let (author, critic_opt, bounty_opt) = ARTWORKS.with(|arts| {
        let arts = arts.borrow();
        if let Some(a) = arts.iter().find(|x| x.id == art_id) {
            let critic = a.critiques.iter().find(|c| c.id == critique_id).map(|c| c.critic);
            (a.author, critic, a.bounty.clone())
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

    let bounty = match bounty_opt {
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

    let ledger = match bounty.token_ledger {
        Some(l) => l,
        None => return ResultText::Err("Ledger canister not set for bounty".to_string()),
    };

    let escrow_bytes = match bounty.escrow_subaccount {
        Some(s) => s,
        None => return ResultText::Err("Escrow subaccount missing".to_string()),
    };

    // wrap as Subaccount
    let escrow_sub = Subaccount(escrow_bytes);
    // AccountIdentifier for escrow (owner = this canister)
    let escrow_account = AccountIdentifier::new(&id(), &escrow_sub);

    // query balance
    let balance_res = account_balance(ledger, AccountBalanceArgs { account: escrow_account.clone() }).await;
    let balance_tokens = match balance_res {
        Ok(t) => t,
        Err((code, msg)) => {
            return ResultText::Err(format!("Failed to query escrow balance: {:?} {}", code, msg))
        }
    };

    let amount_tokens = Tokens::from_e8s(bounty.intended_amount);

    if balance_tokens < amount_tokens {
        return ResultText::Err("Escrow has insufficient funds".to_string());
    }

    // Build transfer args (escrow -> critic's default subaccount)
    let to_account = AccountIdentifier::new(&critic, &DEFAULT_SUBACCOUNT);
    let transfer_args = TransferArgs {
        memo: Memo(0),
        amount: amount_tokens,
        fee: DEFAULT_FEE,
        from_subaccount: Some(escrow_sub),
        to: to_account,
        created_at_time: Some(Timestamp { timestamp_nanos: time() }),
    };

    // perform transfer
    let transfer_res = transfer(ledger, transfer_args).await;

    match transfer_res {
        Ok(Ok(block_index)) => {
            // mark bounty released
            ARTWORKS.with(|arts| {
                let mut artworks = arts.borrow_mut();
                if let Some(art) = artworks.iter_mut().find(|a| a.id == art_id) {
                    if let Some(b) = art.bounty.as_mut() {
                        b.released = true;
                    }
                }
            });
            ResultText::Ok(format!("Bounty transferred to {} (block index: {})", critic.to_text(), block_index))
        }
        Ok(Err(err)) => ResultText::Err(format!("Ledger transfer returned error: {:?}", err)),
        Err(call_err) => ResultText::Err(format!("Cross-canister call to ledger failed: {:?}", call_err)),
    }
}

/// Withdraw bounty: author attempts to refund any escrow back to themselves.
/// If escrow empty, clears metadata.
#[update]
pub async fn withdraw_bounty(art_id: u64) -> ResultText {
    let caller_id = caller();

    let (author, bounty_opt) = ARTWORKS.with(|arts| {
        let arts = arts.borrow();
        if let Some(a) = arts.iter().find(|x| x.id == art_id) {
            (a.author, a.bounty.clone())
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

    let ledger = match bounty.token_ledger {
        Some(l) => l,
        None => return ResultText::Err("Ledger canister not set for bounty".to_string()),
    };

    let escrow_bytes = match bounty.escrow_subaccount {
        Some(s) => s,
        None => return ResultText::Err("Escrow subaccount missing".to_string()),
    };

    let escrow_sub = Subaccount(escrow_bytes);
    let escrow_account = AccountIdentifier::new(&id(), &escrow_sub);

    // get balance
    let balance_res = account_balance(ledger, AccountBalanceArgs { account: escrow_account.clone() }).await;
    let balance_tokens = match balance_res {
        Ok(t) => t,
        Err((code, msg)) => {
            return ResultText::Err(format!("Failed to query escrow balance: {:?} {}", code, msg))
        }
    };

    if balance_tokens == Tokens::from_e8s(0) {
        // clear metadata
        ARTWORKS.with(|arts| {
            let mut artworks = arts.borrow_mut();
            if let Some(art) = artworks.iter_mut().find(|a| a.id == art_id) {
                art.bounty = None;
                art.feedback_bounty = 0;
            }
        });
        return ResultText::Ok("Bounty removed (no funds in escrow)".to_string());
    }

    // transfer full balance back to author
    let transfer_args = TransferArgs {
        memo: Memo(0),
        amount: balance_tokens.clone(),
        fee: DEFAULT_FEE,
        from_subaccount: Some(escrow_sub),
        to: AccountIdentifier::new(&author, &DEFAULT_SUBACCOUNT),
        created_at_time: Some(Timestamp { timestamp_nanos: time() }),
    };

    let transfer_res = transfer(ledger, transfer_args).await;

    match transfer_res {
        Ok(Ok(block_index)) => {
            // clear metadata
            ARTWORKS.with(|arts| {
                let mut artworks = arts.borrow_mut();
                if let Some(art) = artworks.iter_mut().find(|a| a.id == art_id) {
                    art.bounty = None;
                    art.feedback_bounty = 0;
                }
            });
            ResultText::Ok(format!("Bounty refunded to author (block: {})", block_index))
        }
        Ok(Err(err)) => ResultText::Err(format!("Ledger transfer returned error: {:?}", err)),
        Err(call_err) => ResultText::Err(format!("Cross-canister call to ledger failed: {:?}", call_err)),
    }
}

/// Return escrow AccountIdentifier hex for UI (owner = this canister)
#[query]
pub fn get_bounty_escrow_account_hex(art_id: u64) -> Option<String> {
    ARTWORKS.with(|arts| {
        let arts = arts.borrow();
        arts.iter()
            .find(|a| a.id == art_id)
            .and_then(|art| art.bounty.as_ref())
            .and_then(|b| b.escrow_subaccount.map(|sa| {
                let s = Subaccount(sa);
                AccountIdentifier::new(&id(), &s).to_hex()
            }))
    })
}

/// Query escrow balance for UI (returns e8s as u64). Returns 0 if missing or on error.
#[query]
pub async fn get_bounty_escrow_balance(art_id: u64) -> u64 {
    let (ledger_opt, sub_opt) = ARTWORKS.with(|arts| {
        let arts = arts.borrow();
        if let Some(a) = arts.iter().find(|x| x.id == art_id) {
            if let Some(b) = &a.bounty {
                return (b.token_ledger, b.escrow_subaccount);
            }
        }
        (None, None)
    });

    let (ledger, sub) = match (ledger_opt, sub_opt) {
        (Some(l), Some(s)) => (l, s),
        _ => return 0,
    };

    let s = Subaccount(sub);
    let acct = AccountIdentifier::new(&id(), &s);
    match account_balance(ledger, AccountBalanceArgs { account: acct }).await {
        Ok(t) => t.e8s(),
        Err(_) => 0,
    }
}
