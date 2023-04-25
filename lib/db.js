'use strict';

// require configs
const dbPoolObj = require('./pool.js');

/**
 * @class db
 * @classdesc this class is used as db layer.
 */
const DB = function() {
  this._con = null;
};

/**
 * @prototype
 * @desc this function is used to get connection from pool.
 * @param {string} database database name.
 */
DB.prototype.getConnection = async function() {
  this._con = await dbPoolObj.getConnection();
};

/**
 * @prototype
 * @desc this function is used to release connection to pool.
 */
DB.prototype.release = async function() {
  if (this._isActive()) {
    await this._con.release();
  }
};

/**
 * @prototype
 * @desc this function is used to perform sql operations.
 * @param {string} sql sql statement.
 * @param {Array|Object} params arguments for sql can be passed either array or object for binding values in sql.
 */
DB.prototype.execute = async function(sql, params = {}) {
  return await this._con.query(sql, params);
};

/**
 * @prototype
 * @desc this function is used to start transaction for current connection.
 */
DB.prototype.beginTransaction = async function() {
  await this._con.beginTransaction();
};

/**
 * @prototype
 * @desc this function is used to commit transaction for current connection.
 */
DB.prototype.commit = async function() {
  await this._con.commit();
};

/**
 * @prototype
 * @desc this function is used to rollback transaction for current connection.
 */
DB.prototype.rollback = async function() {
  if (this._isActive()) {
    const [rows] = await this.execute('SELECT @@in_transaction AS in_transaction');
    if (rows[0].in_transaction) {
      await this._con.rollback();
    }
  }
};

/**
 * @prototype
 * @desc this function is used to find if connection is active or released to pool.
 * @returns {boolean} either true or false.
 */
DB.prototype._isActive = function() {
  return this._con !== null && dbPoolObj.pool._freeConnections._list.indexOf(this._con.connection) === -1;
};

module.exports = DB;
