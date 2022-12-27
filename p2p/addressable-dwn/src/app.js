import cors from 'cors';
import express from 'express';
import * as Challenge from './store/challenge.js';

import { dwn } from './dwn.js';

const app = express();

app.use(cors());

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

app.post('/dwn', express.json({ type: '*/*' }), async (req, res) => {
  const result = await dwn.processMessage(req.body);

  return res.status(result.status.code).json(result);
});


export default app;