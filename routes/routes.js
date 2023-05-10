"use strict";

const welcomeController = require("../controllers/welcome");
const usersController = require("../controllers/users");
const storeController = require("../controllers/stores");
const productController = require("../controllers/products");
const categoriesController = require("../controllers/categories");
const taxesController = require("../controllers/taxes");
const ordersController = require("../controllers/orders");
const utilController = require("../controllers/utils");
const rateLimitController = require("../controllers/ratelimiter");
const authController = require("../controllers/auth");

const routes = (app) => {
  // welcome
  app.get("/", welcomeController);

  // Registration
  app.post(
    "/register",
    rateLimitController.limiterSecs1Reqs10,
    authController.contentTypeChecker,
    usersController.register.post
  );
  app.get(
    "/verify-email-id/:uid([0-9]{1,})",
    rateLimitController.limiterSecs1Reqs10,
    utilController.paramsJSONParser,
    utilController.queryJSONParser,
    usersController.register.verify
  );

  // login
  app.post(
    "/login",
    authController.contentTypeChecker,
    rateLimitController.limiterSecs1Reqs10,
    usersController.login.post
  );

  // forgot
  app.post(
    "/forgot",
    rateLimitController.limiterSecs1Reqs10,
    authController.contentTypeChecker,
    usersController.forgot.post
  );
  app.get(
    "/forgot/:uid([0-9]{1,})",
    rateLimitController.limiterSecs1Reqs10,
    utilController.paramsJSONParser,
    utilController.queryJSONParser,
    usersController.forgot.get
  );
  app.put(
    "/forgot",
    rateLimitController.limiterSecs1Reqs10,
    authController.contentTypeChecker,
    usersController.forgot.put
  );

  //stores
  app.post(
    "/stores",
    rateLimitController.limiterSecs1Reqs10,
    authController.authChecker,
    authController.contentTypeChecker,
    storeController.stores.post
  );

  //categories
  app.post(
    "/categories",
    rateLimitController.limiterSecs1Reqs10,
    authController.authChecker,
    authController.contentTypeChecker,
    categoriesController.categories.post
  );

  //taxes
  app.post(
    "/taxes",
    rateLimitController.limiterSecs1Reqs10,
    authController.authChecker,
    authController.contentTypeChecker,
    taxesController.taxes.post
  );

  //products
  app.post(
    "/products",
    rateLimitController.limiterSecs1Reqs10,
    authController.authChecker,
    authController.contentTypeChecker,
    productController.products.post
  );
  app.put(
    "/products",
    rateLimitController.limiterSecs1Reqs10,
    authController.authChecker,
    authController.contentTypeChecker,
    productController.products.put
  );
  app.get(
    "/products/:store_id",
    rateLimitController.limiterSecs1Reqs10,
    authController.authChecker,
    productController.products.get
  );

  //sizes
  app.post(
    "/sizes",
    rateLimitController.limiterSecs1Reqs10,
    authController.authChecker,
    authController.contentTypeChecker,
    productController.sizes.post
  );
  app.put(
    "/sizes",
    rateLimitController.limiterSecs1Reqs10,
    authController.authChecker,
    authController.contentTypeChecker,
    productController.sizes.put
  );
  app.get(
    "/sizes/:product_id",
    rateLimitController.limiterSecs1Reqs10,
    authController.authChecker,
    productController.sizes.get
  );

  //cart
  app.post(
    "/cart",
    rateLimitController.limiterSecs1Reqs10,
    authController.authChecker,
    authController.contentTypeChecker,
    ordersController.cart.post
  );
  app.get(
    "/cart/:uid([0-9]{1,})",
    rateLimitController.limiterSecs1Reqs10,
    authController.authChecker,
    ordersController.cart.get
  );
  app.put(
    "/cart",
    rateLimitController.limiterSecs1Reqs10,
    authController.authChecker,
    ordersController.cart.put
  );
};

module.exports = routes;

//add status for category, category update
