// pub.mjs
import * as IPFS from 'ipfs-core'
import os from 'os'
import path from 'path'

const topic = process.env.DWN_ID;
const responseTopic = topic + "-response";

var correlationId = 42;

async function main() {
  // Create an IPFS instance
  const ipfs = await IPFS.create({
    // create a repo just for the publisher node
    repo: path.join(os.tmpdir(), `pub-${Date.now()}`),
    config: {
      Addresses: {
        Swarm: [
          // listen on a random tcp port
          '/ip4/0.0.0.0/tcp/0'
        ]
      }
    }
  })

  // wait for topic peers
  while (true) {
    const peers = await ipfs.pubsub.peers(topic)

    if (peers.length) {
      // there are some peers interested in this topic
      console.log("found topic peers")
      break
    }

    // wait a second to see if some topic peers are found
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 1000)
    })
  }


  // listen for response
  ipfs.pubsub.subscribe(responseTopic, (msg) => {
    console.log(`Received message: ${msg.data.toString()}`)
  })  



  // make request - need correlationId so when we see a response in responseTopic, we know what request it was for. It will be echoed back.
  await ipfs.pubsub.publish(topic, Buffer.from(JSON.stringify({path: "/ping", correlationId: correlationId})))

  console.log("published message to topic")
}

main()