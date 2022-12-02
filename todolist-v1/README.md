- [Summary](#summary)
- [Longer Summary](#longer-summary)
- [How to run](#how-to-run)
- [Thoughts](#thoughts)
  - [The todos can't be accessed anywhere outside of the web app.](#the-todos-cant-be-accessed-anywhere-outside-of-the-web-app)
  - [We're storing a private key in local storage](#were-storing-a-private-key-in-local-storage)
  - [Can't delete any Todos](#cant-delete-any-todos)
  - [Updating a Todo requires clobbering/overwriting the entire todo.](#updating-a-todo-requires-clobberingoverwriting-the-entire-todo)
  - [(less nit) application model used has a leaky abstraction.](#less-nit-application-model-used-has-a-leaky-abstraction)
  - [(nit) no real benefit of `schema`.](#nit-no-real-benefit-of-schema)


## Summary
A simple TODO List App that stores TODOs in a local DWN

## Longer Summary
Stores todos in a DWN that's "embedded" into the webapp. More technically speaking: stores DWeb Messages as IPLD DAG-CBOR blocks that reference IPLD DAG-PB blocks (`data` property is DAG-PB) in IndexedDB.

## How to run
```bash
git clone https://github.com/TBD54566975/web5-labs
cd web5-labs/todolist-v1
npm install
npm run dev
```
Pop open a browser and head over to `https://localhost:5173`.

## Thoughts

TL;DR - DWNs seem kinda pointless unless a single/logical DWN can be accessed by many applications (ideally across many environments)

TL; -

Candidly, the embedded DWN in webapp usage pattern of DWNs feels a bit pointless for the following reasons:

### The todos can't be accessed anywhere outside of the web app. 

This isn't really a limitation of DWNs, it's a browser limitation. Access to the underlying IndexedDB is silo'd to the javascript served by the host of the webapp. I guess if you want to be cheeky you could say "Yes! Decentralization achieved! literally no one can access these todos but me". Yeah Cool... NOT. 

The reality is that you can only access the todos you make on this one specific installation of chrome on the one specific computer you're visiting the webapp from. Browser can choose to delete those indexedDB tables whenever it wants. This todo list app is basically as useful as using an etcha-sketch to maintain a todo list (assuming expert knob profiency)

if anything, this realization definitely validates embedding a DWN into the browser extension wallet because at least the data _can_ be accessed by many applications

---
### We're storing a private key in local storage 
I'm not necessarily concerned about the security or durability ramifications of doing this. It's more the fact there doesn't seem to be any real benefit of _independent verifiability_ in this specific usage pattern because the todo literally isn't leaving the context of the webapp. 

There's no point of associating any sense of identity to these todos because they exist in a vacuum. it's like a "last man on earth scenario", because the DID (and private key associated to this DID) are not portable / usable outside of this specific webapp (ignoring copy/pasting the actual private key to different places)

---
### Can't delete any Todos
Yep, once it's there, it's there forever. unless you manually delete the IndexedDB row using devtools or delete all application data. 

This won't be the case for very long though. Right once `CollectionsDelete` is implemented we'll have the ability to delete todos

---
### Updating a Todo requires clobbering/overwriting the entire todo.
Not a big deal in this specific scenario because each todo is such a small amount of data. but you can imagine this becoming a dealbreaker very quickly. 

this won't be an issue for very long either. `CollectionsCommit` is already tee'd up to be implemented within the next two months.

---
### (less nit) application model used has a leaky abstraction. 

If you take a look at the code, you'll notice that a Todo's ID is also being used as the `recordId` for the DWeb Message. Why? because there's no other way to associate the Todo (aka the data) with the message that "wraps" the data. 

Why do we need to associate the two? because i have to reference the DWeb Message by ID to "update" it (aka override it). Generally speaking, this means that the data itself has to have some awareness of the message envelope. does this mean all data transmitted via DWeb Messages will **necessarily** be coupled to some pointed to the DWeb Message itself? Am i just being fussy or does that seem like an unfortunate comingling ?

---
### (nit) no real benefit of [`schema`](https://github.com/TBD54566975/web5-labs/blob/main/todolist-v1/src/App.vue#L84). 

It's really more of a `tag` or `label` because the only reason this webapp benefits from the presence of `schema` is that we can query by it. There's no validation or dynamic form generation occuring. Again, the lack of schema being beneficial is because this data is forever exiled. Hell, the value used for `schema` is a made up url.