#!/bin/bash

CANISTER_BACKEND="opencritique_backend"
CANISTER_FRONTEND="opencritique_frontend"

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

# Create canisters if they don't exist
log "Creating canisters..."
dfx canister create "$CANISTER_BACKEND" 2>/dev/null || log "$CANISTER_BACKEND already exists, skipping..."
dfx canister create "$CANISTER_FRONTEND" 2>/dev/null || log "$CANISTER_FRONTEND already exists, skipping..."

# Build and deploy
log "Building canisters..."
dfx build || error_exit "Build failed"

log "Deploying canisters..."
dfx deploy || error_exit "Deploy failed"

# # # Upload sample artworks
# # 1. Cosmic Dance (NFT)
# dfx canister call opencritique_backend upload_art \
# '("Cosmic Dance",
#   "Vibrant nebula swirling in a cosmic ballet",
#   "bafkreigdcc2zfp3vqb4ggjhvojadxreq7uum4mxl3dsvxqlyowkvhdakeq",
#   "Alice", "alice@example.com",
#   vec { "space"; "nebula"; "abstract" },
#   0,
#   "CC-BY",
#   opt "image",
#   opt "image/png",
#   null,
#   true,
#   1,
#   ""
# )'

# # 2. Urban Mirage
# dfx canister call opencritique_backend upload_art \
# '("Urban Mirage",
#   "A dreamlike cityscape with distorted reflections",
#   "bafkreic7pwmnllfedk7cmc3hcinbq4srh67eu5jul27kl7uec2kw3zgwxi",
#   "Bob", "bob@example.com",
#   vec { "city"; "surreal"; "mirror" },
#   0,
#   "CC-BY",
#   opt "image",
#   opt "image/png",
#   null,
#   false,
#   0,
#   ""
# )'

# # 3. Whispers of Nature
# dfx canister call opencritique_backend upload_art \
# '("Whispers of Nature",
#   "An ancient forest painted with glowing spirits",
#   "bafkreia3ddnqnydj3zuogrd24tlpsactmj6yugk72gnjgqv6nwpfoie3le",
#   "Clara", "clara@example.com",
#   vec { "nature"; "fantasy"; "forest" },
#   0,
#   "CC-BY",
#   opt "image",
#   opt "image/png",
#   null,
#   false,
#   0,
#   ""
# )'

# # 4. Silent Storm
# dfx canister call opencritique_backend upload_art \
# '("Silent Storm",
#   "A monochrome landscape caught in a moment of lightning",
#   "bafkreicmxbnpluw2vfh7jwsk4pvhavtaeoimzsk2pg7ah5zmaby3nnr4oq",
#   "David", "david@example.com",
#   vec { "storm"; "black-and-white"; "minimal" },
#   0,
#   "CC-BY",
#   opt "image",
#   opt "image/png",
#   null,
#   false,
#   0,
#   ""
# )'

# # 5. Echoes in Blue
# dfx canister call opencritique_backend upload_art \
# '("Echoes in Blue",
#   "Digital abstract waves flowing in cool tones",
#   "bafkreiczlu6eejhav63tdgqwo62bjsfx3eoo5igwcivxgrz2des73lj3im",
#   "Eva", "eva@example.com",
#   vec { "digital"; "waves"; "blue" },
#   0,
#   "CC-BY",
#   opt "image",
#   opt "image/png",
#   null,
#   false,
#   0,
#   ""
# )'

# # 6. Clockwork Dreams
# dfx canister call opencritique_backend upload_art \
# '("Clockwork Dreams",
#   "A steampunk-inspired dream machine in motion",
#   "bafkreicbomk7bulrz2msmyen52fahlc3soniws2z52duhnghduooheooye",
#   "Frank", "frank@example.com",
#   vec { "steampunk"; "mechanical"; "fantasy" },
#   0,
#   "CC-BY",
#   opt "image",
#   opt "image/png",
#   null,
#   false,
#   0,
#   ""
# )'

# # 7. Colorblind Reality
# dfx canister call opencritique_backend upload_art \
# '("Colorblind Reality",
#   "The world through color-filtered eyes",
#   "bafkreiccejoafjyhguk5s2rdkpj4ay2aoqyifqztnkmkhhbpgzqr6xp3je",
#   "Grace", "grace@example.com",
#   vec { "monochrome"; "conceptual"; "vision" },
#   0,
#   "CC-BY",
#   opt "image",
#   opt "image/png",
#   null,
#   false,
#   0,
#   ""
# )'

# # 8. Cyber Lotus (NFT)
# dfx canister call opencritique_backend upload_art \
# '("Cyber Lotus",
#   "A digital flower blooming from circuitry",
#   "bafkreiffzcqem4sbuxnop2xlanoem5agvbiouhgeuuqo3lla35arfsz3mi",
#   "Henry", "henry@example.com",
#   vec { "cyber"; "floral"; "sci-fi" },
#   0,
#   "CC-BY",
#   opt "image",
#   opt "image/png",
#   null,
#   true,
#   2,
#   ""
# )'

# # 9. Molten Core
# dfx canister call opencritique_backend upload_art \
# '("Molten Core",
#   "Lava rivers under a cracked dystopian sky",
#   "bafkreicws6monjkvgwpl5kxl4iewhgyv3k2sophczumcuhpvwetk3chyim",
#   "Ivy", "ivy@example.com",
#   vec { "lava"; "dystopia"; "heat" },
#   0,
#   "CC-BY",
#   opt "image",
#   opt "image/png",
#   null,
#   false,
#   0,
#   ""
# )'

# # 10. Through the Prism
# dfx canister call opencritique_backend upload_art \
# '("Through the Prism",
#   "Light split into a thousand hidden hues",
#   "bafkreifg6ql3krsqogzqnlhu7bcjvq22n2i3k3l6eba44w263zp3s4s4wq",
#   "Jack", "jack@example.com",
#   vec { "light"; "prism"; "colors" },
#   0,
#   "CC-BY",
#   opt "image",
#   opt "image/png",
#   null,
#   false,
#   0,
#   "lindh-o3lck-kpmvk-mvlhp-k5poe-raipw-fa65l-24cnv-ht54i-j53ic-sqe"
# )'

# log "✅ All sample artworks uploaded successfully!"
