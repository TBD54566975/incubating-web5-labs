# Addressable DWN

## How to Run
_assuming you're in the `p2p` directory_
```bash
# this is a workaround for a change that hasn't yet made it to dwn-sdk-js
cd message-store-level-v2
npm install
node bundle.js

cd ../addressable-dwn
npm install --install-links # --install-links installs `message-store-level-v2`

node src/index.js
```