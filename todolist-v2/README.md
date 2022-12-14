# Description
Stores TODOs in a DWN embedded in a chrome extension (aka web5 wallet) using the `web5` API injected onto `window` by the wallet. 

There's another webapp included here that fetches (using the `web5` API) and renders the same TODOs added through the todo app to showcase the ability to access personal data across multiple unrelated webapps.



https://user-images.githubusercontent.com/4887440/207717131-3e7aa7de-d0e3-46db-b99c-3a84e5946bcd.mov



# How to run

There's 3 different projects included in this experiment:
* [Todo List Webapp](./todo-app/)
* [Web5 Wallet](./web5-wallet/)
* [Some Other App](./some-other-app)

```bash
git clone https://github.com/TBD54566975/web5-labs
cd web5-labs/todolist-v2
```

## Web5 Wallet (Chrome Extension)
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



## Todo List App
_assuming you have a terminal open and `cd`'d into `web5-labs/todolist-v2`_

```bash
cd todo-app
npm install
npm run dev
```

Todo List App should now be running on localhost:5173

## Some other App
_assuming you have a terminal open and `cd`'d into `web5-labs/todolist-v2`_

```bash
cd some-other-app
npm install
npm run dev
```

Some Other App should now be running on localhost:5174
