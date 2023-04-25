'use strict';

// require libraries
const debug = require('../lib/debug');

const paramsJSONParser = async (req, _res, next) => {
  try {
    for (const [key, val] of Object.entries(req.params)) {
      try {
        req.params[key] = JSON.parse(val);
      } catch (_err) {
        req.params[key] = val;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};

const queryJSONParser = async (req, _res, next) => {
  try {
    for (const [key, val] of Object.entries(req.query)) {
      try {
        req.query[key] = JSON.parse(val);
      } catch (_err) {
        req.query[key] = val;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};

const unmachedRoutes = async (req, res, next) => {
  try {
    res.status(404).json({
      error: {
        type: 'NOT_FOUND',
        message: `Ooooups! Looks like you are into wrong place or '${req.method}' method not allowed for this url`
      }
    });
  } catch (err) {
    next(err);
  }
};

const errorHandler = async (err, _req, res, _next) => {
  debug.default(err);
  res.status(500).json({
    error: {
      type: 'INTERNAL_SERVER_ERROR',
      message: 'Oops! something went wrong, Please try again'
    }
  });
};

module.exports = {
  paramsJSONParser,
  queryJSONParser,
  unmachedRoutes,
  errorHandler
};
