use ic_cdk::api::{caller, time};
use ic_cdk::{update, query};
// use candid::{CandidType, Principal, Nat};
use serde::{Deserialize, Serialize};
// use std::collections::HashMap;
use candid::{CandidType, Principal};

// // ICP Ledger types and constants
// use ic_ledger_types::{
//     AccountIdentifier, BlockIndex, Memo, Subaccount, Tokens, TransferArgs, TransferError,
//     DEFAULT_SUBACCOUNT, MAINNET_LEDGER_CANISTER_ID,
// };

use ic_ledger_types::*;

// For local testing, you might want to use a different ledger canister ID
const LEDGER_CANISTER_ID: Principal = MAINNET_LEDGER_CANISTER_ID;
const ICP_FEE: u64 = 10_000; // 0.0001 ICP in e8s

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Bounty {
    pub ledger: Principal,
    pub subaccount: Option<Subaccount>,
    pub intended_amount: u64, // in e8s (1 ICP = 100_000_000 e8s)
    pub actual_amount: u64,   // actual amount received
    pub released: bool,
    pub created_at: u64,
    pub expires_at: Option<u64>, // optional expiration timestamp
    pub recipient: Option<Principal>, // who can claim this bounty
}

impl Default for Bounty {
    fn default() -> Self {
        Self {
            ledger: LEDGER_CANISTER_ID,
            subaccount: None,
            intended_amount: 0,
            actual_amount: 0,
            released: false,
            created_at: time(),
            expires_at: None,
            recipient: None,
        }
    }
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct BountyTransferRequest {
    pub artwork_id: u64,
    pub critic_principal: Principal,
    pub amount: u64, // amount to transfer in e8s
}

#[derive(CandidType, Serialize, Debug)]
pub enum BountyError {
    NotFound,
    NotAuthorized,
    AlreadyReleased,
    InsufficientFunds,
    TransferFailed(String),
    InvalidAmount,
    Expired,
    NotReady,
}

#[derive(CandidType, Serialize, Debug)]
pub enum BountyResult {
    Success(String),
    Error(BountyError),
}

// Generate a unique subaccount for each artwork's bounty
fn generate_bounty_subaccount(artwork_id: u64, author: Principal) -> Subaccount {
    let mut subaccount = [0u8; 32];
    let artwork_bytes = artwork_id.to_be_bytes();
    let author_bytes = author.as_slice();
    
    // Combine artwork ID and author principal for uniqueness
    subaccount[0..8].copy_from_slice(&artwork_bytes);
    let author_len = std::cmp::min(author_bytes.len(), 24);
    subaccount[8..8 + author_len].copy_from_slice(&author_bytes[..author_len]);
    
    Subaccount(subaccount)
}

// Get the account identifier for the bounty escrow
fn get_bounty_account_identifier(artwork_id: u64, author: Principal) -> AccountIdentifier {
    let subaccount = generate_bounty_subaccount(artwork_id, author);
    AccountIdentifier::new(&ic_cdk::id(), &subaccount)
}

/// Prepare a bounty for an artwork (called during upload process)
#[update]
pub async fn prepare_bounty(artwork_id: u64, intended_amount: u64) -> BountyResult {
    let caller_principal = caller();
    
    if intended_amount == 0 {
        return BountyResult::Error(BountyError::InvalidAmount);
    }

    let subaccount = generate_bounty_subaccount(artwork_id, caller_principal);
    
    let _bounty = Bounty {
        ledger: LEDGER_CANISTER_ID,
        subaccount: Some(subaccount),
        intended_amount,
        actual_amount: 0,
        released: false,
        created_at: time(),
        expires_at: Some(time() + 30 * 24 * 60 * 60 * 1_000_000_000), // 30 days in nanoseconds
        recipient: None,
    };

    // Note: The actual transfer happens on the frontend using Plug wallet
    // This function just prepares the bounty structure
    BountyResult::Success(format!(
        "Bounty prepared for artwork {}. Please transfer {} ICP to the escrow account.",
        artwork_id,
        intended_amount as f64 / 100_000_000.0
    ))
}

/// Transfer bounty to a critic (only artwork author can do this)
#[update]
pub async fn transfer_bounty_to_critic(
    artwork_id: u64,
    critic_principal: Principal,
    amount: u64,
) -> BountyResult {
    let caller_principal = caller();
    
    // Get artwork and verify caller is the author
    let artwork = crate::ARTWORKS.with(|artworks| {
        artworks.borrow()
            .iter()
            .find(|a| a.id == artwork_id)
            .cloned()
    });

    let artwork = match artwork {
        Some(art) => art,
        None => return BountyResult::Error(BountyError::NotFound),
    };

    if artwork.author != caller_principal {
        return BountyResult::Error(BountyError::NotAuthorized);
    }

    let bounty = match &artwork.bounty {
        Some(b) => b,
        None => return BountyResult::Error(BountyError::NotFound),
    };

    if bounty.released {
        return BountyResult::Error(BountyError::AlreadyReleased);
    }

    // Check if bounty has expired
    if let Some(expires_at) = bounty.expires_at {
        if time() > expires_at {
            return BountyResult::Error(BountyError::Expired);
        }
    }

    // Check available balance
    let available_balance = match get_bounty_balance(artwork_id).await {
        BountyResult::Success(balance_str) => {
            balance_str.parse::<u64>().unwrap_or(0)
        },
        BountyResult::Error(_) => 0,
    };

    if available_balance < amount + ICP_FEE {
        return BountyResult::Error(BountyError::InsufficientFunds);
    }

    // Perform the transfer
    let subaccount = bounty.subaccount.unwrap_or(DEFAULT_SUBACCOUNT);
    let transfer_args = TransferArgs {
        memo: Memo(artwork_id),
        amount: Tokens::from_e8s(amount),
        fee: Tokens::from_e8s(ICP_FEE),
        from_subaccount: Some(subaccount),
        to: AccountIdentifier::new(&critic_principal, &DEFAULT_SUBACCOUNT),
        created_at_time: None,
    };

    match ic_cdk::call::<(TransferArgs,), (Result<BlockIndex, TransferError>,)>(
        LEDGER_CANISTER_ID,
        "transfer",
        (transfer_args,),
    )
    .await
    {
        Ok((Ok(block_index),)) => {
            // Update bounty status if this was the full amount
            if amount >= bounty.intended_amount {
                crate::ARTWORKS.with(|artworks| {
                    let mut artworks = artworks.borrow_mut();
                    if let Some(artwork) = artworks.iter_mut().find(|a| a.id == artwork_id) {
                        if let Some(ref mut bounty) = artwork.bounty {
                            bounty.released = true;
                            bounty.recipient = Some(critic_principal);
                        }
                    }
                });
            }

            BountyResult::Success(format!(
                "Successfully transferred {} ICP to critic {}. Block index: {}",
                amount as f64 / 100_000_000.0,
                critic_principal.to_text(),
                block_index
            ))
        }
        Ok((Err(transfer_error),)) => {
            BountyResult::Error(BountyError::TransferFailed(format!("{:?}", transfer_error)))
        }
        Err((code, msg)) => {
            BountyResult::Error(BountyError::TransferFailed(format!("Call failed: {}: {}", code as u8, msg)))
        }
    }
}

/// Get the balance of a bounty escrow account
#[query]
pub async fn get_bounty_balance(artwork_id: u64) -> BountyResult {
    let artwork = crate::ARTWORKS.with(|artworks| {
        artworks.borrow()
            .iter()
            .find(|a| a.id == artwork_id)
            .cloned()
    });

    let artwork = match artwork {
        Some(art) => art,
        None => return BountyResult::Error(BountyError::NotFound),
    };

    let account_id = get_bounty_account_identifier(artwork_id, artwork.author);

    match ic_cdk::call::<(AccountIdentifier,), (Tokens,)>(
        LEDGER_CANISTER_ID,
        "account_balance",
        (account_id,),
    )
    .await
    {
        Ok((balance,)) => {
            BountyResult::Success(balance.e8s().to_string())
        }
        Err((code, msg)) => {
            BountyResult::Error(BountyError::TransferFailed(format!("Balance check failed: {}: {}", code as u8, msg)))
        }
    }
}

/// Get bounty escrow account identifier as hex string (for frontend wallet integration)
#[query]
pub fn get_bounty_escrow_account_hex(artwork_id: u64, author: Principal) -> String {
    let account_id = get_bounty_account_identifier(artwork_id, author);
    account_id.to_hex()
}

/// Alternative method to get account identifier in a more readable format
#[query]  
pub fn get_bounty_escrow_account_id(artwork_id: u64, author: Principal) -> String {
    let account_id = get_bounty_account_identifier(artwork_id, author);
    account_id.to_string()
}

/// Withdraw remaining bounty funds (only author can do this after expiration or if no critiques)
#[update]
pub async fn withdraw_bounty(artwork_id: u64) -> BountyResult {
    let caller_principal = caller();
    
    let artwork = crate::ARTWORKS.with(|artworks| {
        artworks.borrow()
            .iter()
            .find(|a| a.id == artwork_id)
            .cloned()
    });

    let artwork = match artwork {
        Some(art) => art,
        None => return BountyResult::Error(BountyError::NotFound),
    };

    if artwork.author != caller_principal {
        return BountyResult::Error(BountyError::NotAuthorized);
    }

    let bounty = match &artwork.bounty {
        Some(b) => b,
        None => return BountyResult::Error(BountyError::NotFound),
    };

    // Check if bounty can be withdrawn (expired or no critiques after reasonable time)
    let can_withdraw = if let Some(expires_at) = bounty.expires_at {
        time() > expires_at
    } else {
        // If no expiration set, allow withdrawal after 7 days with no critiques
        time() > bounty.created_at + 7 * 24 * 60 * 60 * 1_000_000_000 && artwork.critiques.is_empty()
    };

    if !can_withdraw && !bounty.released {
        return BountyResult::Error(BountyError::NotReady);
    }

    // Get current balance
    let available_balance = match get_bounty_balance(artwork_id).await {
        BountyResult::Success(balance_str) => {
            balance_str.parse::<u64>().unwrap_or(0)
        },
        BountyResult::Error(e) => return BountyResult::Error(e),
    };

    if available_balance <= ICP_FEE {
        return BountyResult::Error(BountyError::InsufficientFunds);
    }

    let withdraw_amount = available_balance - ICP_FEE;
    let subaccount = bounty.subaccount.unwrap_or(DEFAULT_SUBACCOUNT);

    let transfer_args = TransferArgs {
        memo: Memo(artwork_id),
        amount: Tokens::from_e8s(withdraw_amount),
        fee: Tokens::from_e8s(ICP_FEE),
        from_subaccount: Some(subaccount),
        to: AccountIdentifier::new(&caller_principal, &DEFAULT_SUBACCOUNT),
        created_at_time: None,
    };

    match ic_cdk::call::<(TransferArgs,), (Result<BlockIndex, TransferError>,)>(
        LEDGER_CANISTER_ID,
        "transfer", 
        (transfer_args,),
    )
    .await
    {
        Ok((Ok(block_index),)) => {
            BountyResult::Success(format!(
                "Successfully withdrew {} ICP. Block index: {}",
                withdraw_amount as f64 / 100_000_000.0,
                block_index
            ))
        }
        Ok((Err(transfer_error),)) => {
            BountyResult::Error(BountyError::TransferFailed(format!("{:?}", transfer_error)))
        }
        Err((code, msg)) => {
            BountyResult::Error(BountyError::TransferFailed(format!("Call failed: {}: {}", code as u8, msg)))
        }
    }
}

/// Claim a bounty (for critics - alternative to author transfer)
#[update]
pub async fn claim_bounty(artwork_id: u64) -> BountyResult {
    let caller_principal = caller();
    
    // Verify the caller has posted a critique for this artwork
    let artwork = crate::ARTWORKS.with(|artworks| {
        artworks.borrow()
            .iter()
            .find(|a| a.id == artwork_id)
            .cloned()
    });

    let artwork = match artwork {
        Some(art) => art,
        None => return BountyResult::Error(BountyError::NotFound),
    };

    // Check if caller has critiques on this artwork
    let has_critique = artwork.critiques.iter().any(|c| c.critic == caller_principal);
    if !has_critique {
        return BountyResult::Error(BountyError::NotAuthorized);
    }

    let bounty = match &artwork.bounty {
        Some(b) => b,
        None => return BountyResult::Error(BountyError::NotFound),
    };

    if bounty.released {
        return BountyResult::Error(BountyError::AlreadyReleased);
    }

    // For now, require author approval (they use transfer_bounty_to_critic)
    // This maintains quality control
    BountyResult::Error(BountyError::NotAuthorized)
}

/// Get all bounties for a user (as author)
#[query]
pub fn get_user_bounties(user: Principal) -> Vec<(u64, Bounty)> {
    crate::ARTWORKS.with(|artworks| {
        artworks.borrow()
            .iter()
            .filter(|a| a.author == user && a.bounty.is_some())
            .map(|a| (a.id, a.bounty.clone().unwrap()))
            .collect()
    })
}

/// Get bounty info for a specific artwork
#[query]
pub fn get_artwork_bounty(artwork_id: u64) -> Option<Bounty> {
    crate::ARTWORKS.with(|artworks| {
        artworks.borrow()
            .iter()
            .find(|a| a.id == artwork_id)
            .and_then(|a| a.bounty.clone())
    })
}

/// Helper function to set bounty for an artwork (called from upload_art)
pub fn set_artwork_bounty(artwork_id: u64, intended_amount: u64, author: Principal) -> Option<Bounty> {
    if intended_amount == 0 {
        return None;
    }

    let subaccount = generate_bounty_subaccount(artwork_id, author);
    
    Some(Bounty {
        ledger: LEDGER_CANISTER_ID,
        subaccount: Some(subaccount),
        intended_amount,
        actual_amount: 0,
        released: false,
        created_at: time(),
        expires_at: Some(time() + 30 * 24 * 60 * 60 * 1_000_000_000), // 30 days
        recipient: None,
    })
}
