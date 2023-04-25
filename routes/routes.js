'use strict'

const welcomeController = require("../controllers/welcome");
const usersController = require("../controllers/users");
const utilController = require('../controllers/utils');
const rateLimitController = require("../controllers/ratelimiter");
const authController = require("../controllers/auth");

const routes = (app) => {
    
// welcome
  app.get('/',  welcomeController);

// Registration
app.post('/register', rateLimitController.limiterSecs1Reqs10, authController.contentTypeChecker,  usersController.register.post);
app.get('/verify-email-id/:uid([0-9]{1,})', rateLimitController.limiterSecs1Reqs10, utilController.paramsJSONParser, utilController.queryJSONParser, usersController.register.verify)

// login
app.post('/login', authController.contentTypeChecker, rateLimitController.limiterSecs1Reqs10, usersController.login.post);

// forgot 
app.post('/forgot', rateLimitController.limiterSecs1Reqs10, authController.contentTypeChecker, usersController.forgot.post);
app.get('/forgot/:uid([0-9]{1,})', rateLimitController.limiterSecs1Reqs10, utilController.paramsJSONParser, utilController.queryJSONParser, usersController.forgot.get);
app.put('/forgot', rateLimitController.limiterSecs1Reqs10, authController.contentTypeChecker, usersController.forgot.put);

}

module.exports = routes;