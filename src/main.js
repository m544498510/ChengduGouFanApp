const path = require('path');
const Koa = require('koa');
const json = require('koa-json');
const bodyParser = require('koa-bodyparser');
const staticTool = require('koa-static');
const schedule = require('node-schedule');

const cacheModule = require('./cache');
const config = require('./config');
const router = require('./router');

const app = new Koa();

app.use(bodyParser())
  .use(json(null));

const publicPath = path.resolve(__dirname, '../public');
app.use(staticTool(publicPath));

app.use(router.routes());

const server = app.listen(config.port, () => {
  console.log('Listening at port', server.address().port)
});

cacheModule.getCacheFromFile();

schedule.scheduleJob("0 9 * * *", async ()=>{
  await cacheModule.updateProjects();
  console.log('schedule start: ', new Date());
});