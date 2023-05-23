# Example HTML only app with message protocol

This shows the web5 API for messaging between DIDs in a peer to peer fashion using default DWNs and message syncing.


# To run

Open a terminal and run

`npx http-server .`

Open another terminal and run

`npx http-server .`


You will then have 2 copies of the "dinger" app open. You can open each in seperate browser tabs. 
Each one will get its own DID, and you can copy the DID from one to the other to send messages between them. This works locally, or across any network. You can get a friend across the world to run it.