# Chat App

This trivial chat app uses an addressable DWN (other approaches will soon be available that are p2p and don't require a publicly addressable DWN).

## Building and Running Chat app

* Make sure you have run the pre-requisite steps in the [README](../README.md)
* Build and run the addressable DWN in a separate termional window: instructions [here](./addressable-dwn/README.md)
* use [ngrok](https://ngrok.com/) to open a public port to your local DWN by running `ngrok http 3000` - take note of the public https URL that it returns. You'll need this later.
* Build and run the chat-app in another terminal window: `cd chat-app && npm install && npm run dev`
* Click on the wallet action in the sidebar and create an Identity. For DWN Host Provider, put the address of the addressable dwn you just started with the public https url from ngrok above.
  * _Note: currently in order to send messages to anyone you'll actually need to expose your DWN via `ngrok`.
* Pop open a browser and head to `http://localhost:5275`
* In the DWN Request Access Popup, select the Identity you just created.
* find someone to send a message to and talk to them, you can find your DID in the wallet sidebar sidebar and use the "copy" icon to share it.

## Interesting code

Take a look at [src/App.vue](./src/App.vue) to see how the app is built, take note of the "protocol" being installed for chat.
