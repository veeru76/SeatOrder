'use strict';

const config = {};
config.env = process.env.NODE_ENV || 'development';
config.port = process.env.PORT || 8888;

module.exports = config;
