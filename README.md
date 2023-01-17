# Web5 Example Apps

A collection of Work In Progress example apps.

## Examples

* [`todo-app`](./todo-app) the "canonical" todo app that every framework has to have. This is a good single user starting point for a "hello world" style of app. Stores your todos in your Decentralized web node. 
* `chat-app` a more complex app that shows network style interaction and communication with other people via their decentralized identifier

## Supporting repos

* `web5-wallet` a draft implementation of a wallet to run as a browser extension to enable web5 apps (which has its own DWeb Node contained within it)
* `addressable-dwn` This is a "DWN as a service" which can be used by the chat demo to allow people to sync messages.
* `message-store-level-v2` a (temporary) implementation of data storage using LevelDB (this will soon be merged into the DWN SDK so will go away)
 
# Getting Started

## Pre-requisites (just do once)

1. (temporary) Install the message-store-level-v2 patch: `cd message-store-level-v2 && npm install && node bundle.js`
2. Build and then install the web5-wallet into chrome, follow the instructions [here](./web5-wallet/README.md)

## To Do example app

This app is the simplest starting point.

* `cd todo-app && npm install && npm run dev`
* Open a browser and navigate to `http://localhost:5173` - this will show the TODO app which stores your todos in your DWeb Node.
* The code that powers it is all [here](./todo-app/src/App.vue)


## Chat App

The chat app involves a few more moving parts currently, and you will need a friend, follow along [here](./chat-app/README.md).

