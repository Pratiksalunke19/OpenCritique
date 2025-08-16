#!/bin/bash
set -e

CANISTER=opencritique_backend

echo "=== Using default identity (controller) ==="
dfx identity use default

DEFAULT_PRINCIPAL=$(dfx identity get-principal --identity default)
TEST_PRINCIPAL=$(dfx identity get-principal --identity test_identity)

echo "Default principal: $DEFAULT_PRINCIPAL"
echo "Test principal: $TEST_PRINCIPAL"

echo "=== Check canister info ==="
dfx canister info $CANISTER

echo "=== Calling as default identity (admin) ==="
dfx canister call $CANISTER get_artworks '()'

echo "=== Switching to test_identity (user) ==="
dfx identity use test_identity

# Upload artwork as test_identity (example)
dfx canister call $CANISTER upload_art '("Mona Lisa", "Famous painting", "cid123", "user1", "user1@mail.com", vec {"classic"; "portrait"}, 50, "CC0")'

# Post a critique on artwork id=0
dfx canister call $CANISTER post_critique '(0, "Amazing work!")'

echo "=== Switching back to default ==="
dfx identity use default