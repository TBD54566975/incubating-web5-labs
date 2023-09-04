import Koa from 'koa';
import Router from '@koa/router';
import { koaBody } from 'koa-body';
import cors from '@koa/cors';
import { Web5 } from '@tbd54566975/web5';

async function receiveHttp(ctx) {
  const encodedMessage = ctx.get(Web5.transports.http.headerKey);
  if (!encodedMessage) throw 'Message is missing or malformed';

  const message = Web5.transports.http.messageDecoder(encodedMessage);
  const data = ctx.request.body;
  console.log('MESSAGE:', message);
  console.log('DATA', data);
}

const router = new Router();
const server = new Koa();

router.post('/dwn', async (ctx, _next) => {
  try {
    await receiveHttp(ctx);
    ctx.status = 200;
    ctx.body = `${port}`;
  }
  catch(err) {
    console.log(err);
    ctx.status = 400;
    ctx.body = err;
    return;
  }
  return;
});

server
  .use(cors())
  .use(koaBody())
  .use(router.routes())
  .use(router.allowedMethods());


const port = 8088;
server.listen(port);

console.log(`listening on port ${port}`);
