'use strict'

const config = {};
config.host = process.env.DBHOST || "localhost";
config.user = process.env.DBUSER || "root";
config.password = process.env.DBPASSWORD || "password";
config.port = process.env.PORT || 3306;
config.database = 'seatorder';
config.connectionLimit = process.env.CONNECTIONLIMIT || 5;
config.waitForConnections = true;
config.queueLimit = 0;
config.decimalNumbers = true;
config.supportBigNumbers = true;
config.bigNumberStrings = true;
config.dateStrings = true;
config.timezone = 'Z';
config.charset = 'utf8mb4';
config.namedPlaceholders = true;


module.exports = config;