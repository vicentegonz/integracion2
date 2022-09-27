/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const Koa = require('koa');
const koaBody = require('koa-body');
const cors = require('koa2-cors');
const db = require('./models');
require('dotenv').config();
const bodyParser = require('koa-bodyparser');

const app = new Koa();
app.context.db = db;

app.use(koaBody()); 
var options = {
	origin: '*'
};
app.use(cors(options));

// body parser
app.use(bodyParser());

//require the router here 
let index = require('./routes/index');
let del = require('./routes/del');
let air = require('./routes/airports');
let flight = require('./routes/flights');

//use the router here
app.use(index.routes());
app.use(del.routes());
app.use(air.routes());
app.use(flight.routes());

module.exports = app;