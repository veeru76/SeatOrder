'use strict';

const config = {};
config.secret = process.env.JWT_SECRET || '3bda7654bca0a6359d7465ac5f68451f';
config.algorithm = 'HS256';
config.expiresIn = {
  accessToken: '5h',
  refreshToken: '3d'
};
config.noTimestamp = true;

module.exports = config;
