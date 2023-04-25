'use strict';

const debugPkg = require('debug');

const MODULE_NAMES = ['cluster', 'server', 'process', 'redis', 'performance', 'puppeteer', 'connection_pool', 'mail', 'default'];

const debug = {};
MODULE_NAMES.forEach(module => debug[module] = debugPkg(module));

module.exports = debug;
