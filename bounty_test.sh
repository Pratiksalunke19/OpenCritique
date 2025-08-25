# Artist uploads artwork and sets bounty amount
dfx canister call opencritique_backend upload_art '(
  "Test Art",
  "Test Description", 
  "QmTestCID123",
  "testuser",
  "test@email.com",
  vec { "digital"; "art" },
  1000000 : nat64,
  "MIT",
  opt "image",
  opt "image/png",
  null,
  false,
  0 : nat64,
  ""
)'

# Test 2: Get bounty account (with correct types)
dfx canister call opencritique_backend get_bounty_escrow_account_id '(1 : nat64, principal "4kv37-faflm-cez5j-m4wqf-q2pyv-3y3ls-rirbq-3fh25-ihfo4-guysh-tae")'

# Test 3: Check artwork bounty
dfx canister call opencritique_backend get_artwork_bounty '(1 : nat64)'

# Test 4: Post critique
dfx canister call opencritique_backend post_critique '(1 : nat64, "Great artwork! Love the style.")'