'use strict';

// require packages
const rateLimit = require('express-rate-limit');

// require libraries
const jwtObj = require('./../lib/jwt.js');

const _options = {
  keyGenerator: (req) => {
    const token = Object.hasOwn(req.headers, 'authorization') ? req.headers.authorization.replace('Bearer ', '') : '';
    const jwtData = jwtObj.verify(token);
    return jwtData.isValid ? token : req.ip;
  },
  handler: function(_req, res) {
    res.status(429).json({
      error: {
        type: 'TOO_MANY_REQUESTS',
        message: 'Request limit exceeded'
      }
    });
  }
};

module.exports = {
  limiterSecs1Reqs1: rateLimit({
    ..._options,
    ...{
      windowMs: 1 * 1e3,
      max: 1
    }
  }),
  limiterSecs1Reqs3: rateLimit({
    ..._options,
    ...{
      windowMs: 1 * 1e3,
      max: 3
    }
  }),
  limiterSecs1Reqs10: rateLimit({
    ..._options,
    ...{
      windowMs: 1 * 1e3,
      max: 10
    }
  }),
  limiterSecs1Reqs40: rateLimit({
    ..._options,
    ...{
      windowMs: 1 * 1e3,
      max: 40
    }
  }),
  limiterSecs1Reqs1000: rateLimit({
    ..._options,
    ...{
      windowMs: 1 * 1e3,
      max: 1000
    }
  }),
  limiterSecs60Reqs2: rateLimit({
    ..._options,
    ...{
      windowMs: 60 * 1e3,
      max: 2
    }
  }),
  limiterSecs60Reqs5: rateLimit({
    ..._options,
    ...{
      windowMs: 60 * 1e3,
      max: 5
    }
  })
};
