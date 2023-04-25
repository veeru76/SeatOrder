'use strict';

// require packages
const jwt = require('jsonwebtoken');

// require configs
const jwtConfig = require('./../config/jwt.js');

/**
 * @desc create signed token.
 * @param {object} payload - json object.
 * @param {string} jwtid - unique identifier for this token.
 * @param {string} token_type - either access_token or refresh_token.
 * @returns {string} token.
 */
const sign = (payload, jwtid, tokenType) => {
  try {
    return jwt.sign(payload, jwtConfig.secret, {
      algorithm: jwtConfig.algorithm,
      expiresIn: jwtConfig.expiresIn[tokenType],
      jwtid,
      noTimestamp: jwtConfig.noTimestamp
    });
  } catch (_err) {
    return '';
  }
};

/**
 * @desc decode to get jwt data with isValid and isExpired.
 * @param {string} token - token.
 * @returns {object} jwtData.
 */
const verify = (token) => {
  const jwtData = {};
  try {
    jwtData.payload = jwt.verify(token, jwtConfig.secret, {
      algorithm: jwtConfig.algorithm,
      ignoreExpiration: true
    });
    jwtData.isValid = true;

    const now = Math.floor(new Date().getTime() / 1e3);
    jwtData.isExpired = jwtData.payload.exp < now ? true : false;
  } catch (_err) {
    jwtData.isValid = false;
  }
  return jwtData;
};

module.exports = {
  sign,
  verify
};
