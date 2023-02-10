# Chat App

This trivial chat app uses an addressable DWN (other approaches will soon be available that are p2p and don't require a publicly addressable DWN).

## Building and Running Chat app

### Prerequites:
- Run: `cd message-store-level-v2 && npm install && node bundle.js`<br />
This will install the message-store-level-v2 patch (temporary) 
- Build and then install the web5-wallet into chrome, follow the instructions [here](../web5-wallet/README.md)
- Build and run the addressable DWN in a separate termional window: instructions [here](../addressable-dwn/README.md)
- Run: `ngrok http 3000` <br />
This will use [ngrok](https://ngrok.com/) to open a public port to your local DWN - take note of the public https URL that it returns. You'll need this later.


### Next Steps:
* Run: `cd chat-app && npm install && npm run dev` <br />
This will build and run the chat-app in another terminal window

* Click on the wallet action in the sidebar and create a Profile. For DWN Host Provider, put the address of the addressable dwn you just started with the public https url from ngrok above.

* Open browser `http://localhost:5275`

* In the DWN Request Access Popup, select the Profile you just created.

## Now what?
* Find someone to send a message to and talk to them, you can find your DID in the wallet sidebar sidebar and use the "copy" icon to share it!

## Interesting code
Take a look at [src/App.vue](./src/App.vue) to see how the app is built, take note of the "protocol" being installed for chat.
