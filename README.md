OpenCritique is a decentralized Web3 platform built on the Internet Computer (ICP) where artists upload works-in-progress (WIPs) and receive constructive feedback from the community. Critics are rewarded for detailed, helpful comments using a transparent, on-chain reputation and token system.

Our Aim : 
- Foster a decentralized platform for art critique and curation.
-  Empower artists to receive meaningful feedback from the community.
-  Leverage blockchain (ICP) to ensure transparency, authenticity, and permanence.
-  Establish a fair and democratic system for artwork discovery through DAO governance.
-  Build a censorship-resistant space where art and opinions thrive freely.

# Setup (For local ICP blockchain)

clone the project : 

``` git clone https://github.com/Pratiksalunke19/OpenCritique.git ```

cd OpenCritique

## Backend Setup: 

use following command to install DFX SDK : 

```sh -ci "$(curl -fsSL https://smartcontracts.org/install.sh)"```

verify installation using: 

``` dfx --version ```

Install Rust toolchain (for backend canister development) : 

``` curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh ```

Verify rust installation: 

``` rustc --version ```

``` cargo --version ```

Set up nightly toolchain and WebAssembly target:

``` rustup install nightly ```

``` rustup default nightly ```

``` rustup target add wasm32-unknown-unknown ``` 

Start local ICP blockchain and deploy canisters :

``` dfx start --background ``` 

``` dfx build ```

``` dfx deploy ```

## Frontend Setup: 

Install Core dependencies : 

``` npm install ```

```npm install @dfinity/agent @dfinity/candid```

```npm install react-router-dom```

```npm install pinata```

```npm install -D tailwindcss@3 postcss autoprefixer```

```npm install --save-dev typescript @types/react @types/react-dom```

```npm install lucide-react```

Install fonts and icons : 

``` npm install --save react-icons ```

Add Aurora background (via jsrepo):

``` npx jsrepo add https://reactbits.dev/tailwind/Backgrounds/Aurora ```

You are ready to contribute !!
