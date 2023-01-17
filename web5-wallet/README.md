# Web5 Wallet

## Build/Install instructions
_assuming you're in the `p2p` directory_
```
# this is a workaround for a change that hasn't yet made it to dwn-sdk-js
cd message-store-level-v2
npm install
node bundle.js

cd ../web5-wallet
# --install-links installs `message-store-level-v2`
npm install --install-links

npm run build
```
* pop open a chrome window
* navigate to chrome://extensions
* toggle Developer Mode on (toggle should be on top right)
* click on Load Unpacked
* navigate to `web5-labs/p2p/web5-wallet`
* select the `dist` directory. The extension should now appear in the tiled list of installed extensions
* click the puzzle icon to the right of the omnibar
* click the pushpin icon next to Web5 Wallet