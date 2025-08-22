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

# # Upload sample artworks
# upload_art() {
#   local title="$1"
#   local desc="$2"
#   local cid="$3"
#   local user="$4"
#   local email="$5"
#   local tags="$6"
#   local rating="$7"
#   local license="$8"
#   local media_type="$9"
#   local mime_type="${10}"
#   local text_excerpt="${11}"

#   # Convert empty fields to `null` for optional params
#   local media_type_arg="null"
#   if [[ -n "$media_type" ]]; then
#     media_type_arg="opt \"$media_type\""
#   fi

#   local mime_type_arg="null"
#   if [[ -n "$mime_type" ]]; then
#     mime_type_arg="opt \"$mime_type\""
#   fi

#   local text_excerpt_arg="null"
#   if [[ -n "$text_excerpt" ]]; then
#     text_excerpt_arg="opt \"$text_excerpt\""
#   fi

#   log "Uploading art: $title"
#   if ! dfx canister call "$CANISTER_BACKEND" upload_art \
#     "(\"$title\", \"$desc\", \"$cid\", \"$user\", \"$email\", $tags, $rating, \"$license\", $media_type_arg, $mime_type_arg, $text_excerpt_arg)"; then
#     error_exit "Failed to upload art: $title"
#   fi
# }

# # Sample uploads with proper optional fields
# upload_art "Cosmic Dance" "Vibrant nebula swirling in a cosmic ballet" \
# "bafkreigdcc2zfp3vqb4ggjhvojadxreq7uum4mxl3dsvxqlyowkvhdakeq" "UserB" "userb@example.com" \
# 'vec { "space"; "nebula"; "abstract" }' 2 "CC-BY" \
# "image" "image/png" null

# upload_art "Urban Mirage" "A dreamlike cityscape with distorted reflections" \
# "bafkreic7pwmnllfedk7cmc3hcinbq4srh67eu5jul27kl7uec2kw3zgwxi" "UserC" "userc@example.com" \
# 'vec { "city"; "surreal"; "mirror" }' 4 "CC-BY" \
# "image" "image/png" null

# upload_art "Whispers of Nature" "An ancient forest painted with glowing spirits" \
# "bafkreia3ddnqnydj3zuogrd24tlpsactmj6yugk72gnjgqv6nwpfoie3le" "UserD" "userd@example.com" \
# 'vec { "nature"; "fantasy"; "forest" }' 3 "CC-BY" \
# "image" "image/png" null

# upload_art "Silent Storm" "A monochrome landscape caught in a moment of lightning" \
# "bafkreicmxbnpluw2vfh7jwsk4pvhavtaeoimzsk2pg7ah5zmaby3nnr4oq" "UserE" "usere@example.com" \
# 'vec { "storm"; "black-and-white"; "minimal" }' 1 "CC-BY" \
# "image" "image/png" null

# upload_art "Echoes in Blue" "Digital abstract waves flowing in cool tones" \
# "bafkreiczlu6eejhav63tdgqwo62bjsfx3eoo5igwcivxgrz2des73lj3im" "UserF" "userf@example.com" \
# 'vec { "digital"; "waves"; "blue" }' 2 "CC-BY" \
# "image" "image/png" null


# log "✅ All sample artworks uploaded successfully!"
