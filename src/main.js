const path = require('path');
const Koa = require('koa');
const Router = require('koa-router');
const json = require('koa-json');
const bodyParser = require('koa-bodyparser');
const staticTool = require('koa-static');

const estateData = require('./estateData');

const app = new Koa();

app.use(bodyParser())
  .use(json(null));

const publicPath = path.resolve(__dirname, '../public');
app.use(staticTool(publicPath));

const router = new Router();
router.get('/projects', ctx => {
  ctx.body = estateData.getData();
});
router.get('/completeProjects', ctx => {
  ctx.body = estateData.getCompleteData();
});
router.get('/detail', async ctx=>{
  ctx.body = await estateData.ajaxDetail(ctx.query.id);
});
router.get('/flushData', async ctx=>{
  await estateData.ajaxProjects();
  ctx.body = estateData.getData();
});
app.use(router.routes());

const server = app.listen(8080, () => {
  console.log('Listening at port', server.address().port)
});

estateData.ajaxProjects();