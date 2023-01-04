import cors from 'cors';
import express from 'express';
import * as Challenge from './store/challenge.js';

import { CID } from 'multiformats';
import { dwn, messageStore } from './dwn.js';

const app = express();

app.use(cors());

app.post('/dwn', express.json({ type: '*/*' }), async (req, res) => {
  console.log(new Date(), '/dwn', JSON.stringify(req.body, null, 4));
  const result = await dwn.processMessage(req.body);

  return res.status(result.status.code).json(result);
});

// TODO: discuss making this a DWN interface method with Daniel and Henry
app.post('/dwn/event-log', express.json({ type: '*/*' }), async (req, res) => {
  // janky "authn" for now. value of authorization is just tenant DID
  const { authorization: tenant } = req.headers;
  let { watermark } = req.body;

  try {
    const eventLog = await messageStore.getEventLog(tenant, watermark);
    console.log(new Date(), '[/dwn/event-log]', eventLog);
    return res.status(200).json({ data: eventLog });
  } catch (e) {
    console.error(`[/dwn/event-log] error: ${e}`);
    return res.sendStatus(500);
  }

});

// gets message by CID
// TODO: discuss making this a DWN interface method with Daniel and Henry
app.get('/dwn/messages/:cid', express.json({ type: '*/*' }), async (req, res) => {
  // janky "authn" for now. value of authorization is just tenant DID
  const { authorization: tenant } = req.headers;
  let { cid } = req.params;

  try {
    // TODO: CID validation
    cid = CID.parse(cid);

    // TODO: ensure CID belongs to tenant
    const message = await messageStore.get(cid);
    console.log(new Date(), '[/dwn/messages/cid]', JSON.stringify(message, null, 4));

    if (message) {
      return res.status(200).json({ data: message });
    } else {
      return res.sendStatus(404);
    }
  } catch (e) {
    console.error(`[/dwn/message/:cid] error: ${e}`);
    return res.sendStatus(500);
  }
});

app.get('/tenants/challenge', async (_, res) => {
  const challenge = await Challenge.create();

  return res.json({ challenge });
});

app.post('/tenants', express.json(), async (req, res) => {
  const { proof } = req.body;

  if (!proof) {
    return res.status(400).json({ error: 'proof required' });
  }
});


export default app;