## how to start this project

run `npm install` or `npm i` to install all node dependencies. you'll see `node_modules` folder (gitignored) pop up and get populated.

then, in one bash window, run `node bundle.js && npx http-server .`, then navigate to localhost:8080/alice.html

do the same in a new bash window (in vscode, you can `split` a window into 2), then navigate to localhost:8081:pfi.html

you should now have 2 separate DIDs and their respective DWNs connected (one belonging to Alice, another to PFI) so they can start pushing / pulling data.