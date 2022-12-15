# Better Application Model for using DWNs <!-- omit from toc --> 

Simple Todo App that stores TODOs in a local DWN that can be accessed by other web apps

- [Description](#description)
- [How to run](#how-to-run)
  - [Web5 Wallet (Chrome Extension)](#web5-wallet-chrome-extension)
  - [Todo List App](#todo-list-app)
  - [Some other App](#some-other-app)
- [Thoughts](#thoughts)
  - [Using web5 API to read/write from shared local DWN provides a better developer experience](#using-web5-api-to-readwrite-from-shared-local-dwn-provides-a-better-developer-experience)
  - [Access Control for data stored within DWN is far too relaxed](#access-control-for-data-stored-within-dwn-is-far-too-relaxed)
  - [Data is more usable but not really](#data-is-more-usable-but-not-really)


## Description
Stores TODOs in a DWN embedded in a chrome extension (aka web5 wallet) using the `web5` API injected onto `window` by the wallet. 

There's another webapp included here that fetches (using the `web5` API) and renders the same TODOs added through the todo app to showcase the ability to access personal data across multiple unrelated webapps.


https://user-images.githubusercontent.com/4887440/207717131-3e7aa7de-d0e3-46db-b99c-3a84e5946bcd.mov

## How to run

There's 3 different projects included in this experiment:
* [Todo List Webapp](./todo-app/)
* [Web5 Wallet](./web5-wallet/)
* [Some Other App](./some-other-app)

```bash
git clone https://github.com/TBD54566975/web5-labs
cd web5-labs/todolist-v2
```

### Web5 Wallet (Chrome Extension)
_assuming you have a terminal open and `cd`'d into `web5-labs/todolist-v2`_

```bash
cd web5-wallet
npm install
npm run build
```

* pop open a chrome window
* navigate to chrome://extensions
* toggle Developer Mode on (toggle should be on top right)
* click on Load Unpacked
* navigate to `web5-labs/todolist-v2/web5-wallet`
* select the `dist` directory. The extension should now appear in the tiled list of installed extensions
* click the puzzle icon to the right of the omnibar
* click the pushpin icon next to Web5 Wallet



https://user-images.githubusercontent.com/4887440/207717202-5e223dee-8c06-4b77-8403-30c37e6cd500.mov


### Todo List App
_assuming you have a terminal open and `cd`'d into `web5-labs/todolist-v2`_

```bash
cd todo-app
npm install
npm run dev
```

Todo List App should now be running on localhost:5173

### Some other App
_assuming you have a terminal open and `cd`'d into `web5-labs/todolist-v2`_

```bash
cd some-other-app
npm install
npm run dev
```

Some Other App should now be running on localhost:5174


## Thoughts

TL;DR - Storing data in a DWN that is accessible by mutiple applications feels far more useful than the application model followed in [todolist-v1](../todolist-v1/)

TL; -
### Using web5 API to read/write from shared local DWN provides a better developer experience
At least IMO. If you compare writing a TODO to a DWN in [todolist-v1](https://github.com/TBD54566975/web5-labs/blob/main/todolist-v1/src/App.vue#L74-L88) and [todolist-v2](https://github.com/TBD54566975/web5-labs/blob/main/todolist-v2/todo-app/src/App.vue#L65-L74), you'll notice that the web5 api requires a lot less from you than using the SDK itself. specifically:
* No private key is required
  * this addresses a downside brought up [here](../todolist-v1/README.md#were-storing-a-private-key-in-local-storage)
* Don't have to serialize `data` to bytes
  * you may still have to. i just added the convenience of not having to _specifically for_ json. Actually just checking `dataFormat`

This is because the wallet is taking care of signing and serializing as a way to _optionally_ tuck some complexity away. This however does mean that the TODOs are stored with the signature of the _user_ and not of the _application_. honestly, this makes sense to me conceptually at least because .. well.. i did in fact create the todo after all. however, in the general sense, it does raise some attack vector concerns around the ability to frame somebody. Imagine an app pretends to be storing todos in your DWN but actually ends up writing a testimony that you murdered someone, which the wallet happily signs using your private key and stores it in your DWN. Yikes@aol.com. We may want to preserve the fact that the application _facilitated_ the write 

### Access Control for data stored within DWN is far too relaxed
In this demo, read/write access to all data is a binary yes/no. "Want to read/write TODOs to my DWN? here's full blown access to read/write **everything**". We need more fine-grained access control. DWNs have [permissions](https://identity.foundation/decentralized-web-node/spec/#permissions) but we don't have them fully implemented in the SDK.

**TODO**: add image of access control popup

### Data is more usable but not really 
It's nice that data stored within a DWN can be accessed by more than one webapp but this is still limited to a single browser installation on one specific desktop computer. Can't access this data on different devices or even different browsers on the same computer. 