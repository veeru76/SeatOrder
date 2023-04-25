'use strict';

// require packages
const mysql = require('mysql2/promise');

// require configs
const debug = require('./debug.js');
const dbConfig = require('../config/db.js');


//create pool

const poolObj = mysql.createPool({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    connectionLimit: dbConfig.connectionLimit,
    waitForConnections: dbConfig.waitForConnections,
    queueLimit: dbConfig.queueLimit,
    decimalNumbers: dbConfig.decimalNumbers,
    supportBigNumbers: dbConfig.supportBigNumbers,
    bigNumberStrings: dbConfig.bigNumberStrings,
    dateStrings: dbConfig.dateStrings,
    timezone: dbConfig.timezone,
    charset: dbConfig.charset,
    namedPlaceholders: dbConfig.namedPlaceholders
  });


// pool events
poolObj.on('acquire', (con) => {
    debug.connection_pool('acquired %d', con.threadId);
  });
  
  poolObj.on('connection', (con) => {
    debug.connection_pool('created %d', con.threadId);
  });
  
  poolObj.on('enqueue', () => {
    debug.connection_pool('waiting...');
  });
  
  poolObj.on('release', (con) => {
    debug.connection_pool('released %d', con.threadId);
  });
  
  module.exports = poolObj;
  