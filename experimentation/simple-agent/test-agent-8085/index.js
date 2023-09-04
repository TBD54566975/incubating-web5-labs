import Koa from 'koa';
import Router from '@koa/router';
import { koaBody } from 'koa-body';
import cors from '@koa/cors';
import { initializeProtocols, loadConfig, receiveHttp, web5 } from './utils.js';

await loadConfig();
await initializeProtocols();

const router = new Router();
const server = new Koa();

router.post('/operator', async (ctx, _next) => {
  ctx.status = 200;
  console.log(ctx.get('did'));
  const response = await web5.did.resolve(ctx.get('did'));
  console.log('RESOLUTION RESPONSE:', response);
  ctx.body = 'hello';
  return;
});

router.post('/dwn', async (ctx, _next) => {
  try {
    const response = await receiveHttp(ctx);

    // Normalize DWN MessageReply and HTTP Reponse
    ctx.status = response?.status?.code ?? response?.status;
    ctx.statusText = response?.status?.detail ?? response?.statusText;
    ctx.body = 'entries' in response ? { entries: response.entries } : response.body;
  }
  catch(err) {
    console.error(err);
    ctx.status = 400;
    ctx.body = err;
    return;
  }
  return;
});

server
  .use(cors())
  .use(koaBody({
    multipart: true,
  }))
  .use(router.routes())
  .use(router.allowedMethods());


const port = 8085;
server.listen(port);

console.log(`listening on port ${port}`);
