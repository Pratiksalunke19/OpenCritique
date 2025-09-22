#!/bin/bash

CANISTER_BACKEND="opencritique_backend"
CANISTER_FRONTEND="opencritique_frontend"
CANISTER_LEDGER="icp_ledger_canister"

log() {
  echo -e "\033[1;34m[INFO]\033[0m $1"
}

error_exit() {
  echo -e "\033[1;31m[ERROR]\033[0m $1"
  exit 1
}

# Stop any running dfx
log "Stopping any running dfx..."
dfx stop || true


# Start a fresh local replica
log "Starting dfx with --clean..."
dfx start --clean --background || error_exit "Failed to start dfx"

# Deploy ICP Ledger first (required for bounty system)
log "Deploying ICP Ledger canister..."
dfx deploy "$CANISTER_LEDGER" --argument "(variant {Init = record {
  minting_account = \"$(dfx ledger account-id)\";
  initial_values = vec {
    record { 
      \"$(dfx ledger account-id)\"; 
      record { e8s=100000000000 : nat64 }
    }
  };
  send_whitelist = vec {};
  transfer_fee = opt record { e8s = 10_000 : nat64 };
  token_symbol = opt \"LICP\";
  token_name = opt \"Local ICP\";
}})" || error_exit "Ledger deployment failed"

# Create canisters if they don't exist
log "Creating canisters..."
dfx canister create "$CANISTER_BACKEND" 2>/dev/null || log "$CANISTER_BACKEND already exists, skipping..."
dfx canister create "$CANISTER_FRONTEND" 2>/dev/null || log "$CANISTER_FRONTEND already exists, skipping..."

# Get and display ledger canister ID for bounty.rs update
LEDGER_ID=$(dfx canister id "$CANISTER_LEDGER")
log "✅ Ledger deployed with ID: $LEDGER_ID"
log "⚠️  UPDATE bounty.rs with this ID: Principal::from_text(\"$LEDGER_ID\")"

# Build and deploy other canisters
log "Building canisters..."
dfx build || error_exit "Build failed"

log "Deploying backend and frontend..."
dfx deploy "$CANISTER_BACKEND" || error_exit "Backend deploy failed"
dfx deploy "$CANISTER_FRONTEND" || error_exit "Frontend deploy failed"

# Verify ledger balance using correct flag
log "Checking ledger balance..."
dfx ledger balance --ledger-canister-id "$LEDGER_ID" && log "✅ Balance check successful"

# Test bounty system
log "Testing bounty system..."
dfx canister call "$CANISTER_BACKEND" get_bounty_balance '(6)' && log "✅ Bounty balance test successful"

# Create helpful aliases for testing
log "Creating helpful aliases..."
echo "export LEDGER_ID=$LEDGER_ID" > .env.local
echo "alias local-balance='dfx ledger balance --ledger-canister-id $LEDGER_ID'" >> .env.local
echo "alias local-transfer='dfx ledger transfer --ledger-canister-id $LEDGER_ID'" >> .env.local
echo "alias local-account-id='dfx ledger account-id'" >> .env.local

log "🎉 Deployment complete!"
log "📝 Next steps:"
log "   1. Update bounty.rs ledger canister ID to: $LEDGER_ID"
log "   2. Rebuild with: dfx build $CANISTER_BACKEND && dfx deploy $CANISTER_BACKEND"
log "   3. Source aliases: source .env.local"
log "   4. Test with: local-balance"


# # Upload sample artworks
# 1. Cosmic Dance (NFT)
dfx canister call opencritique_backend upload_art \
'("Cosmic Dance",
  "Vibrant nebula swirling in a cosmic ballet",
  "bafkreigdcc2zfp3vqb4ggjhvojadxreq7uum4mxl3dsvxqlyowkvhdakeq",
  "Alice", "alice@example.com",
  vec { "space"; "nebula"; "abstract" },
  1,
  "CC-BY",
  opt "image",
  opt "image/png",
  null,
  false,
  1,
  ""
)'

# 2. Urban Mirage
dfx canister call opencritique_backend upload_art \
'("Urban Mirage",
  "A dreamlike cityscape with distorted reflections",
  "bafkreic7pwmnllfedk7cmc3hcinbq4srh67eu5jul27kl7uec2kw3zgwxi",
  "Bob", "bob@example.com",
  vec { "city"; "surreal"; "mirror" },
  0,
  "CC-BY",
  opt "image",
  opt "image/png",
  null,
  false,
  0,
  ""
)'

# 3. Whispers of Nature
dfx canister call opencritique_backend upload_art \
'("Whispers of Nature",
  "An ancient forest painted with glowing spirits",
  "bafkreia3ddnqnydj3zuogrd24tlpsactmj6yugk72gnjgqv6nwpfoie3le",
  "Clara", "clara@example.com",
  vec { "nature"; "fantasy"; "forest" },
  0,
  "CC-BY",
  opt "image",
  opt "image/png",
  null,
  false,
  0,
  ""
)'

# 4. Silent Storm
dfx canister call opencritique_backend upload_art \
'("Silent Storm",
  "A monochrome landscape caught in a moment of lightning",
  "bafkreicmxbnpluw2vfh7jwsk4pvhavtaeoimzsk2pg7ah5zmaby3nnr4oq",
  "David", "david@example.com",
  vec { "storm"; "black-and-white"; "minimal" },
  0,
  "CC-BY",
  opt "image",
  opt "image/png",
  null,
  false,
  0,
  ""
)'

# 5. Echoes in Blue
dfx canister call opencritique_backend upload_art \
'("Echoes in Blue",
  "Digital abstract waves flowing in cool tones",
  "bafkreiczlu6eejhav63tdgqwo62bjsfx3eoo5igwcivxgrz2des73lj3im",
  "Eva", "eva@example.com",
  vec { "digital"; "waves"; "blue" },
  0,
  "CC-BY",
  opt "image",
  opt "image/png",
  null,
  false,
  0,
  ""
)'

# 6. Clockwork Dreams
dfx canister call opencritique_backend upload_art \
'("Clockwork Dreams",
  "A steampunk-inspired dream machine in motion",
  "bafkreicbomk7bulrz2msmyen52fahlc3soniws2z52duhnghduooheooye",
  "Frank", "frank@example.com",
  vec { "steampunk"; "mechanical"; "fantasy" },
  0,
  "CC-BY",
  opt "image",
  opt "image/png",
  null,
  false,
  0,
  ""
)'

# 7. Colorblind Reality
dfx canister call opencritique_backend upload_art \
'("Colorblind Reality",
  "The world through color-filtered eyes",
  "bafkreiccejoafjyhguk5s2rdkpj4ay2aoqyifqztnkmkhhbpgzqr6xp3je",
  "Grace", "grace@example.com",
  vec { "monochrome"; "conceptual"; "vision" },
  0,
  "CC-BY",
  opt "image",
  opt "image/png",
  null,
  false,
  0,
  ""
)'

# 8. Cyber Lotus (NFT)
dfx canister call opencritique_backend upload_art \
'("Cyber Lotus",
  "A digital flower blooming from circuitry",
  "bafkreiffzcqem4sbuxnop2xlanoem5agvbiouhgeuuqo3lla35arfsz3mi",
  "Henry", "henry@example.com",
  vec { "cyber"; "floral"; "sci-fi" },
  0,
  "CC-BY",
  opt "image",
  opt "image/png",
  null,
  true,
  2,
  ""
)'

# 9. Molten Core
dfx canister call opencritique_backend upload_art \
'("Molten Core",
  "Lava rivers under a cracked dystopian sky",
  "bafkreicws6monjkvgwpl5kxl4iewhgyv3k2sophczumcuhpvwetk3chyim",
  "Ivy", "ivy@example.com",
  vec { "lava"; "dystopia"; "heat" },
  0,
  "CC-BY",
  opt "image",
  opt "image/png",
  null,
  false,
  0,
  ""
)'

# 10. Through the Prism
dfx canister call opencritique_backend upload_art \
'("Through the Prism",
  "Light split into a thousand hidden hues",
  "bafkreifg6ql3krsqogzqnlhu7bcjvq22n2i3k3l6eba44w263zp3s4s4wq",
  "Jack", "jack@example.com",
  vec { "light"; "prism"; "colors" },
  0,
  "CC-BY",
  opt "image",
  opt "image/png",
  null,
  false,
  0,
  "lindh-o3lck-kpmvk-mvlhp-k5poe-raipw-fa65l-24cnv-ht54i-j53ic-sqe"
)'

#funding artwork1
export ESCROW=$(dfx canister call opencritique_backend get_artwork_escrow_account '(1)' | grep -o '"[^"]*"' | tr -d '"')
dfx ledger transfer --ledger-canister-id bkyz2-fmaaa-aaaaa-qaaaq-cai     --amount 1.0     --fee 0     --memo 1     $ESCROW

# log "✅ All sample artworks uploaded successfully!"

# # Upload artwork with bounty ✅
# # Fund escrow account ✅ 
# dfx ledger transfer --amount 1.0 --fee 0 --memo 1 [escrow_account]
# # Result: Transfer sent at BlockHeight: 1

# # Check balance ✅
# dfx canister call opencritique_backend get_bounty_balance '(1)'
# # Result: "Balance: 1 ICP (100000000 e8s)"

# # Transfer bounty to critic ✅
# dfx canister call opencritique_backend transfer_bounty_to_critic "(1, principal \"mu7ba-6vje6-...\", 50000000)"
# # Result: "Successfully transferred 0.5 ICP to critic... Block index: 2"

# # Verify critic received ICP ✅
# dfx ledger balance --ledger-canister-id bkyz2-fmaaa-aaaaa-qaaaq-cai
# # Result: 0.50000000 ICP

# # Verify remaining escrow balance ✅
# dfx canister call opencritique_backend get_bounty_balance '(1)'  
# # Result: "Balance: 0.4999 ICP (49990000 e8s)" (after fee deduction)

