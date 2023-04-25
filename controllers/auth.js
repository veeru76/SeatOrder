'use strict';

// require packages
const crypto = require('crypto');

// require configs
const jwtConfig = require('./../config/jwt.js');

// require libraries
const DB = require('./../lib/db.js');
const shareseyeObj = require('../lib/utils.js');
const jwtObj = require('./../lib/jwt.js');

const authChecker = async (req, res, next) => {
  try {
    if (Object.hasOwn(req.headers, 'authorization')) {
      if (!req.headers.authorization.includes('Bearer ')) {
        res.status(401).json({
          error: {
            type: 'UNAUTHORIZED',
            sub_type: 'AUTHENTICATION_TYPE',
            message: 'Authentication type is not allowed'
          }
        });
        return;
      }

      const token = req.headers.authorization.replace('Bearer ', '');
      const jwtData = jwtObj.verify(token);
      if (jwtData.isValid && !jwtData.isExpired) {
        res.locals.payload = jwtData.payload;
        next();
      } else if (!jwtData.isValid) {
        res.status(400).json({
          error: {
            type: 'BAD_REQUEST',
            sub_type: 'INVALID_ACCESS_TOKEN',
            message: 'Invalid access token'
          }
        });
      } else if (jwtData.isExpired) {
        res.status(401).json({
          error: {
            type: 'UNAUTHORIZED',
            sub_type: 'EXPIRED_ACCESS_TOKEN',
            message: 'Expired access token'
          }
        });
      }
    } else {
      res.status(401).json({
        error: {
          type: 'UNAUTHORIZED',
          sub_type: 'MISSING_ACCESS_TOKEN',
          message: `access token is not present in headers. Please use 'authorization' in headers key`
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

const contentTypeChecker = async (req, res, next) => {
  try {
    if (Object.hasOwn(req.headers, 'content-type')) {
      if (req.headers['content-type'].toLowerCase() !== 'application/json; charset=utf-8') {
        res.status(415).json({
          error: {
            type: 'UNSUPPORTED_MEDIA_TYPE',
            sub_type: 'MISSING_CONTENT_TYPE',
            message: `content-type value mismatch it should be 'application/json; charset=utf-8'`
          }
        });
      } else {
        next();
      }
    } else {
      res.status(415).json({
        error: {
          type: 'UNSUPPORTED_MEDIA_TYPE',
          sub_type: 'MISSING_CONTENT_TYPE',
          message: 'content-type header missing'
        }
      });
    }
  } catch(err) {
    next(err);
  }
};

const createNewTokensController = async (req, res, next) => {
  const con = new DB();
  try {

    // validation
    const schema = {
      properties: {
        access_token: {
          required: true,
          type: 'string'
        },
        refresh_token: {
          required: true,
          type: 'string'
        }
      }
    };
    const err = shareseyeObj.jsonSchema.validate(schema, req.body);
    if (err.length) {
      res.status(422).json({
        error: {
          type: 'UNPROCESSABLE_ENTITY',
          sub_type: 'SCHEMA_ERROR',
          message: err
        }
      });
      return;
    }

    const accessToken = req.body.access_token.replace('Bearer ', '');
    const jwtDataAccessToken = jwtObj.verify(accessToken);
    if (jwtDataAccessToken.isValid) {
      const refreshToken = req.body.refresh_token.replace('Bearer ', '');
      const jwtDataRefreshToken = jwtObj.verify(refreshToken);
      if (jwtDataRefreshToken.isValid) {
        if (!jwtDataRefreshToken.isExpired) {

          // con
          await con.getConnection();

          // check row exist or not
          const [rows] = await con.execute('SELECT jwtid FROM tokens WHERE access_token_hash = :access_token_hash AND refresh_token_hash = :refresh_token_hash', {
            access_token_hash: crypto.createHash('md5').update(accessToken).digest('hex'),
            refresh_token_hash: crypto.createHash('md5').update(refreshToken).digest('hex')
          });

          if (rows.length) {

            // output
            const output = {};

            // create access token
            delete jwtDataAccessToken.payload.exp;
            delete jwtDataAccessToken.payload.jti;
            output.access_token = jwtObj.sign(jwtDataAccessToken.payload, rows[0].jwtid, 'accessToken');
            output.expires_in = jwtConfig.expiresIn.accessToken;

            // create refresh_token
            delete jwtDataRefreshToken.payload.exp;
            delete jwtDataRefreshToken.payload.jti;
            output.refresh_token = jwtObj.sign(jwtDataRefreshToken.payload, rows[0].jwtid, 'refreshToken');

            // update in our database
            await con.execute(`INSERT INTO tokens (jwtid, access_token_hash, refresh_token_hash)
              VALUES (:jwtid, :access_token_hash, :refresh_token_hash)
              ON DUPLICATE KEY UPDATE access_token_hash = :access_token_hash, refresh_token_hash = :refresh_token_hash;`, {
              jwtid: rows[0].jwtid,
              access_token_hash: crypto.createHash('md5').update(output.access_token).digest('hex'),
              refresh_token_hash: crypto.createHash('md5').update(output.refresh_token).digest('hex')
            });

            res.status(200).json(output);
          } else {
            res.status(400).json({
              error: {
                type: 'BAD_REQUEST',
                sub_type: 'TOKEN_NOTEXIST',
                message: 'access token and refresh token are valid but not exist in our records'
              }
            });
          }
        } else {
          res.status(400).json({
            error: {
              type: 'BAD_REQUEST',
              sub_type: 'EXPIRED_REFRESH_TOKEN',
              message: 'Expired refresh token'
            }
          });
        }
      } else {
        res.status(400).json({
          error: {
            type: 'BAD_REQUEST',
            sub_type: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid refresh token'
          }
        });
      }
    } else {
      res.status(400).json({
        error: {
          type: 'BAD_REQUEST',
          sub_type: 'INVALID_ACCESS_TOKEN',
          message: 'Invalid access token'
        }
      });
    }
  } catch (err) {
    next(err);
  } finally {
    await con.release();
  }
};

module.exports = {
  authChecker,
  contentTypeChecker,
  createNewTokensController
};
