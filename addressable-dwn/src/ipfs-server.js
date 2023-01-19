
import * as IPFS from 'ipfs-core'
import os from 'os'
import path from 'path'
import { dwn, messageStore } from './dwn.js';
import { CID } from 'multiformats';
import * as Challenge from './store/challenge.js';

//
// Set DWN_ID to something random and unique for this DWN instance, which will be used in DWN service
//   'ipfs-pubsub://<DWN_ID>'. Responses come back by listening to '<DWN_ID>-response'
//

const topic = process.env.DWN_ID;
const responseTopic = topic + "-response";

async function main() {
  // Create an IPFS instance
  const ipfs = await IPFS.create({
    // create a repo just for the subscriber node
    repo: path.join(os.tmpdir(), `sub-${Date.now()}`),
    config: {
      Addresses: {
        Swarm: [
          // listen on a random tcp port
          '/ip4/0.0.0.0/tcp/0'
        ]
      }
    }
  })

  // reply to the response topic, using the request's correlationId to ensure it goes back to the right place
  function response(req, messageObject) {
    messageObject['correlationId'] = req['correlationId'];
    ipfs.pubsub.publish(responseTopic, Buffer.from(JSON.stringify(messageObject)));
  }
  
  ipfs.pubsub.subscribe(topic, async (msg) => {

    console.log(msg.data.toString());
    console.log(`Received message: ${msg.data.toString()}`);
    const req = JSON.parse(msg.data.toString());
    switch (req['path']) {
      case '/ping':
        response(req, {status:200, data:"pong"})        
        break;     
      case '/dwn':
        const result = await dwn.processMessage(req['body']);
        console.log(new Date(), '/dwn', JSON.stringify(result));        
        response(req, {status:200, data:result});        
        break;

      case '/dwn/event-log':
        // janky "authn" for now. value of authorization is just tenant DID
        var { authorization: tenant } = req['headers'];
        let { watermark } = req['body'];
        try {
          const eventLog = await messageStore.getEventLog(tenant, watermark);
          console.log(new Date(), '[/dwn/event-log]', eventLog);
          response(req, {status:200, data:eventLog});                  
        } catch (e) {
          response(req, {status:500})          
          console.error(`[/dwn/event-log] error: ${e}`);
        }
        break;

      case '/dwn/messages':
                // janky "authn" for now. value of authorization is just tenant DID
        var { authorization: tenant } = req['headers'];
        let { cid } = req['cid'];

        try {
          // TODO: CID validation
          cid = CID.parse(cid);

          // TODO: ensure CID belongs to tenant
          const message = await messageStore.get(cid);
          console.log(new Date(), '[/dwn/messages/cid]', JSON.stringify(message, null, 4));

          if (message) {
            response(req, {status:200, data:message});                        
          } else {
            response(req, {status:404});            
          }
        } catch (e) {
          console.error(`[/dwn/message/:cid] error: ${e}`);
          response(req, {status:500})          
        }
        break;

        case '/tenants/challenge':
          const challenge = await Challenge.create();
          response(req, {status:200, data:challenge});          
          break;

        case '/tenants':
          const { proof } = req['body'];
          if (!proof) {
            response(req, {status:400, error:'proof required'});            
          }  
          break;


    }

    console.log(`Received message: ${msg.data.toString()}`)
  })
}



main()