const Router = require('koa-router');

const cacheModule = require('./cache');
const estateData = require('./estateData');

const router = new Router();
router.get('/projects', ctx => {
  ctx.body = cacheModule.getProjects().registeringData;
});
router.get('/completeProjects', ctx => {
  ctx.body = cacheModule.getProjects().completeData;
});
router.get('/detail', async ctx=>{
  ctx.body = await estateData.ajaxDetail(ctx.query.id);
});
router.get('/flushData', async ctx=>{
  await cacheModule.updateProjects();
  ctx.body = cacheModule.getProjects().registeringData;
});

module.exports = router;
