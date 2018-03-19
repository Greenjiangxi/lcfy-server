const http = require('http');
const Koa = require('koa');
const path = require('path');
const views = require('koa-views');
const convert = require('koa-convert');
const json = require('koa-json');
const bodyparser = require('koa-bodyparser')();
const koabody = require('koa-body');
const logger = require('koa-logger');
const koaStatic = require('koa-static-plus');
const koaOnError = require('koa-onerror');
const cors = require('@koa/cors');
const jwt = require('koa-jwt')
const config = require('../config');

const app = new Koa();

global.config = config;

// middlewares
app.use(cors());
app.use(convert(bodyparser));
app.use(convert(koabody({})));
app.use(convert(json()));
app.use(convert(logger()));
app.use(jwt({secret: config.jwtSecret}).unless({path:[/^\//,/^\/signin_pw/,/^\/signin_vc/, /^\/signup/, /^\/send_vc/, /^\/home/]}))

// static
app.use(
  convert(
    koaStatic(path.join(__dirname, '../public'), {
      pathPrefix: '',
    })
  )
);

// http status logger response
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// error logger
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = 400;
    console.log(err);
    err.expose = true;
    err._error = err.message;
    ctx.body = err;
  }
});

// response router
app.use(async (ctx, next) => {
  await require('./routes').routes()(ctx, next);
});
app.use(async (ctx, next) => {
  await require('./routes').allowedMethods();
});


const port = parseInt(config.port || '3000');
const server = http.createServer(app.callback());

server.listen(port);
server.on('error', error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(port + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(port + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});
server.on('listening', () => {
  console.log('Listening on port: %d', port);
});

module.exports = server;
