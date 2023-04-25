'use strict';

// require packages
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const compression = require('compression');


// require configs
const handlebarsHelpersConfig = require('../config/handlebars-helpers.js');

const app = express();

// dont include `X-Powered-By: Express` in response header
app.disable('x-powered-by');

// web cache validation and conditional requests from browsers for resources
app.set('etag', 'strong');

// enable trust proxy for nodejs indicates the app is running as reverse proxy behind apache/nginx
app.enable('trust proxy');

// when enabled, the router treats "/foo" and "/foo/" as different
app.enable('strict routing');

// when enabled, "/Foo" and "/foo" are different routes
app.enable('case sensitive routing');

// handlebars
app.engine('hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: null,
  helpers: handlebarsHelpersConfig,
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views/render');


// compress all responses
app.use(compression());

// support parsing of application/json type post data
app.use(bodyParser.json({
  limit: '50mb'
}));

// support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));

// cors middleware
app.use(cors());
// route file
const routes = require('../routes/routes.js');
routes(app);

module.exports = app;