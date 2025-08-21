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

# Upload sample artworks
upload_art() {
  local title="$1"
  local desc="$2"
  local cid="$3"
  local user="$4"
  local email="$5"
  local tags="$6"
  local rating="$7"
  local license="$8"

  log "Uploading art: $title"
  if ! dfx canister call "$CANISTER_BACKEND" upload_art \
    "(\"$title\", \"$desc\", \"$cid\", \"$user\", \"$email\", $tags, $rating, \"$license\")"; then
    error_exit "Failed to upload art: $title"
  fi
}

upload_art "Cosmic Dance" "Vibrant nebula swirling in a cosmic ballet" "bafkreigdcc2zfp3vqb4ggjhvojadxreq7uum4mxl3dsvxqlyowkvhdakeq" "UserB" "userb@example.com" 'vec { "space"; "nebula"; "abstract" }' 2 "CC-BY"
upload_art "Urban Mirage" "A dreamlike cityscape with distorted reflections" "bafkreic7pwmnllfedk7cmc3hcinbq4srh67eu5jul27kl7uec2kw3zgwxi" "UserC" "userc@example.com" 'vec { "city"; "surreal"; "mirror" }' 4 "CC-BY"
upload_art "Whispers of Nature" "An ancient forest painted with glowing spirits" "bafkreia3ddnqnydj3zuogrd24tlpsactmj6yugk72gnjgqv6nwpfoie3le" "UserD" "userd@example.com" 'vec { "nature"; "fantasy"; "forest" }' 3 "CC-BY"
upload_art "Silent Storm" "A monochrome landscape caught in a moment of lightning" "bafkreicmxbnpluw2vfh7jwsk4pvhavtaeoimzsk2pg7ah5zmaby3nnr4oq" "UserE" "usere@example.com" 'vec { "storm"; "black-and-white"; "minimal" }' 1 "CC-BY"
upload_art "Echoes in Blue" "Digital abstract waves flowing in cool tones" "bafkreiczlu6eejhav63tdgqwo62bjsfx3eoo5igwcivxgrz2des73lj3im" "UserF" "userf@example.com" 'vec { "digital"; "waves"; "blue" }' 2 "CC-BY"
upload_art "Clockwork Dreams" "A steampunk-inspired dream machine in motion" "bafkreicbomk7bulrz2msmyen52fahlc3soniws2z52duhnghduooheooye" "UserG" "userg@example.com" 'vec { "steampunk"; "mechanical"; "fantasy" }' 3 "CC-BY"
upload_art "Colorblind Reality" "The world through color-filtered eyes" "bafkreiccejoafjyhguk5s2rdkpj4ay2aoqyifqztnkmkhhbpgzqr6xp3je" "UserH" "userh@example.com" 'vec { "monochrome"; "conceptual"; "vision" }' 5 "CC-BY"
upload_art "Cyber Lotus" "A digital flower blooming from circuitry" "bafkreiffzcqem4sbuxnop2xlanoem5agvbiouhgeuuqo3lla35arfsz3mi" "UserI" "useri@example.com" 'vec { "cyber"; "floral"; "sci-fi" }' 2 "CC-BY"
upload_art "Molten Core" "Lava rivers under a cracked dystopian sky" "bafkreicws6monjkvgwpl5kxl4iewhgyv3k2sophczumcuhpvwetk3chyim" "UserJ" "userj@example.com" 'vec { "lava"; "dystopia"; "heat" }' 4 "CC-BY"
upload_art "Through the Prism" "Light split into a thousand hidden hues" "bafkreifg6ql3krsqogzqnlhu7bcjvq22n2i3k3l6eba44w263zp3s4s4wq" "UserK" "userk@example.com" 'vec { "light"; "prism"; "colors" }' 1 "CC-BY"
upload_art "Forgotten Frequencies" "A soundwave suspended in the void" "bafkreienj3nqd7kkr7z4ydeb4pgz5ruzswzjyl6nuw7vvm3s4qrsc5q5ny" "UserL" "userl@example.com" 'vec { "sound"; "void"; "vibration" }' 3 "CC-BY"

log "✅ All sample artworks uploaded successfully!"
