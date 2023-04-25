'use strict';

// require packages
const moment = require('moment');
const request = require('request');
const exec = require('child_process').exec;
const readline = require('readline');
const {
  stdin: input,
  stdout: output
} = require('process');

const seatorder = {};

/**
 * @desc it is used to validate JSON schema, developed from the inspiration of @link
 * {@link https://json-schema.org/}.
 */
seatorder.jsonSchema = (function() {
  const _isInteger = function(x) {
    return typeof x === 'number' && x % 1 === 0;
  };
  const _isFloat = function(x) {
    return typeof x === 'number' && (x % 1 === 0 || x % 1 !== 0);
  };
  const _isString = function(x) {
    return typeof x === 'string';
  };
  const _isBoolean = function(x) {
    return typeof x === 'boolean';
  };
  const _isObject = function(x) {
    return typeof x === 'object' && x instanceof Object && !Array.isArray(x);
  };
  const _isArray = function(x) {
    return typeof x === 'object' && x instanceof Array && Array.isArray(x);
  };
  const _isFunction = function(x) {
    return typeof x === 'function' && x instanceof Function;
  };
  const validate = function(schema, json, err = []) {

    // if json is not object
    if (!_isObject(json)) {
      err.push({
        property: '',
        value: json,
        type: 'object',
        message: 'Invalid inputdata'
      });
      return err;
    }

    // extra properties
    for (const eachProperty in json) {
      if (schema.properties && !Object.hasOwn(schema.properties, eachProperty)) {
        err.push({
          property: eachProperty,
          message: 'Extra property found in the JSON'
        });
      }
    }

    // loop each schema property
    for (const eachProperty in schema.properties) {

      // if schema property not exist in json
      if (!Object.hasOwn(json, eachProperty)) {

        // and it is required
        if (schema.properties[eachProperty].required) {
          err.push({
            property: eachProperty,
            message: 'Not found in the JSON'
          });
        }
      } else {

        // defalut value
        if (Object.hasOwn(schema.properties[eachProperty], 'default') && !Object.hasOwn(json, eachProperty)) {
          json.eachProperty = schema.properties[eachProperty].default;
        }

        // type
        if (schema.properties[eachProperty].type === 'integer') {
          if (!_isInteger(json[eachProperty])) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              type: 'integer',
              message: 'Invalid property value type'
            });
          }

          // minimum
          if (Object.hasOwn(schema.properties[eachProperty], 'minimum') && schema.properties[eachProperty].minimum > json[eachProperty]) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              minimum: schema.properties[eachProperty].minimum,
              message: 'Property value doesn\'t satisfy min value constraint'
            });
          }

          // maximum
          if (Object.hasOwn(schema.properties[eachProperty], 'maximum') && schema.properties[eachProperty].maximum < json[eachProperty]) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              maximum: schema.properties[eachProperty].maximum,
              message: 'Property value doesn\'t satisfy max value constraint'
            });
          }
        } else if (schema.properties[eachProperty].type === 'float') {
          if (!_isFloat(json[eachProperty])) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              type: 'float',
              message: 'Invalid property value type'
            });
          }

          // minimum
          if (Object.hasOwn(schema.properties[eachProperty], 'minimum') && schema.properties[eachProperty].minimum > json[eachProperty]) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              minimum: schema.properties[eachProperty].minimum,
              message: 'Property value doesn\'t satisfy min value constraint'
            });
          }

          // maximum
          if (Object.hasOwn(schema.properties[eachProperty], 'maximum') && schema.properties[eachProperty].maximum < json[eachProperty]) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              maximum: schema.properties[eachProperty].maximum,
              message: 'Property value doesn\'t satisfy max value constraint'
            });
          }
        } else if (schema.properties[eachProperty].type === 'string') {
          if (!_isString(json[eachProperty])) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              type: 'string',
              message: 'Invalid property value type'
            });
          }

          // value
          if (Object.hasOwn(schema.properties[eachProperty], 'values') && !schema.properties[eachProperty].values.includes(json[eachProperty])) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              values: schema.properties[eachProperty].values,
              message: 'Property value doesn\'t satisfy allowed values constraint'
            });
          }

          // minlength
          if (Object.hasOwn(schema.properties[eachProperty], 'minlength') && schema.properties[eachProperty].minlength > json[eachProperty].length) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              minlength: schema.properties[eachProperty].minlength,
              message: 'Property value doesn\'t satisfy min length constraint'
            });
          }

          // maxlength
          if (Object.hasOwn(schema.properties[eachProperty], 'maxlength') && schema.properties[eachProperty].maxlength < json[eachProperty].length) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              maxlength: schema.properties[eachProperty].maxlength,
              message: 'Property value doesn\'t satisfy max length constraint'
            });
          }

          // pattern
          if (Object.hasOwn(schema.properties[eachProperty], 'pattern') && !new RegExp(schema.properties[eachProperty].pattern).test(json[eachProperty])) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              pattern: schema.properties[eachProperty].pattern.toString(),
              message: 'Invalid property value, it should be matched with pattern '
            });
          }
        } else if (schema.properties[eachProperty].type === 'boolean') {
          if (!_isBoolean(json[eachProperty])) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              type: 'boolean',
              message: 'Invalid property value type'
            });
          }
        } else if (schema.properties[eachProperty].type === 'object') {
          if (!_isObject(json[eachProperty])) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              type: 'object',
              message: 'Invalid property value type'
            });
          } else {
            const eachErr = validate(schema.properties[eachProperty], json[eachProperty]);
            err = err.concat(eachErr);
          }
        } else if (schema.properties[eachProperty].type === 'array') {
          if (!_isArray(json[eachProperty])) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              type: 'array',
              message: 'Invalid property value type'
            });
          } else {
            for (let i = 0; i < json[eachProperty].length; i++) {
              if (schema.properties[eachProperty].itemstype === 'integer') {
                if (!_isInteger(json[eachProperty][i])) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    type: 'integer',
                    message: 'Invalid property value type'
                  });
                }

                // minimum
                if (Object.hasOwn(schema.properties[eachProperty], 'itemsminimum') && schema.properties[eachProperty].itemsminimum > json[eachProperty][i]) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    minimum: schema.properties[eachProperty].itemsminimum,
                    message: 'Property value doesn\'t satisfy min value constraint'
                  });
                }

                // maximum
                if (Object.hasOwn(schema.properties[eachProperty], 'itemsmaximum') && schema.properties[eachProperty].itemsmaximum < json[eachProperty][i]) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    maximum: schema.properties[eachProperty].itemsmaximum,
                    message: 'Property value doesn\'t satisfy max value constraint'
                  });
                }
              } else if (schema.properties[eachProperty].itemstype === 'float') {
                if (!_isFloat(json[eachProperty][i])) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    type: 'float',
                    message: 'Invalid property value type'
                  });
                }

                // minimum
                if (Object.hasOwn(schema.properties[eachProperty], 'itemsminimum') && schema.properties[eachProperty].itemsminimum > json[eachProperty][i]) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    minimum: schema.properties[eachProperty].itemsminimum,
                    message: 'Property value doesn\'t satisfy min value constraint'
                  });
                }

                // maximum
                if (Object.hasOwn(schema.properties[eachProperty], 'itemsmaximum') && schema.properties[eachProperty].itemsmaximum < json[eachProperty][i]) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    maximum: schema.properties[eachProperty].itemsmaximum,
                    message: 'Property value doesn\'t satisfy max value constraint'
                  });
                }
              } else if (schema.properties[eachProperty].itemstype === 'string') {
                if (!_isString(json[eachProperty][i])) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    type: 'string',
                    message: 'Invalid property value type'
                  });
                }

                // value
                if (Object.hasOwn(schema.properties[eachProperty], 'itemsvalues') && !schema.properties[eachProperty].itemsvalues.includes(json[eachProperty][i])) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    values: schema.properties[eachProperty].itemsvalues,
                    message: 'Property value doesn\'t satisfy allowed values constraint'
                  });
                }

                // minlength
                if (Object.hasOwn(schema.properties[eachProperty], 'itemsminlength') && schema.properties[eachProperty].itemsminlength > json[eachProperty][i].length) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    minlength: schema.properties[eachProperty].itemsminlength,
                    message: 'Property value doesn\'t satisfy min length constraint'
                  });
                }

                // maxlength
                if (Object.hasOwn(schema.properties[eachProperty], 'itemsmaxlength') && schema.properties[eachProperty].itemsmaxlength < json[eachProperty][i].length) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    maxlength: schema.properties[eachProperty].itemsmaxlength,
                    message: 'Property value doesn\'t satisfy max length constraint'
                  });
                }

                // pattern
                if (Object.hasOwn(schema.properties[eachProperty], 'itemspattern') && !new RegExp(schema.properties[eachProperty].itemspattern).test(json[eachProperty][i])) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    pattern: schema.properties[eachProperty].itemspattern.toString(),
                    message: 'Invalid property value, it should be matched with pattern '
                  });
                }
              } else if (schema.properties[eachProperty].itemstype === 'object') {
                if (!_isObject(json[eachProperty][i])) {
                  err.push({
                    property: eachProperty,
                    index: i,
                    value: json[eachProperty][i],
                    type: 'object',
                    message: 'Invalid property value type'
                  });
                } else {
                  const eachErr = validate(schema.properties[eachProperty], json[eachProperty][i]);
                  err = err.concat(eachErr);
                }
              }
            }
          }
        } else if (schema.properties[eachProperty].type === 'function') {
          if (!_isFunction(json[eachProperty])) {
            err.push({
              property: eachProperty,
              value: json[eachProperty],
              type: 'function',
              message: 'Invalid property value type'
            });
          }
        }
      }
    }

    return err;
  };
  return {
    validate
  };
})();

/**
 * @desc seatorder.uuid is used to genereate universal unique identifier 4 version.
 * {@link http://stackoverflow.com/posts/2117523/revisions}.
 */
seatorder.uuid = (function() {
  const v4 = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  const isv4 = function(uuid) {
    const regex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[ab89][0-9a-f]{3}-[0-9a-f]{12}$/);
    return regex.test(uuid);
  };
  return {
    v4,
    isv4
  };
})();

/**
 * seatorder math functions
 */
seatorder.math = (function() {
  /**
   * @desc Returns a random number between min (inclusive) and max (exclusive).
   * @param {number} min - min number.
   * @param {number} max - max number.
   * @returns {number} random number.
   * {@link http://bootstrap-notify.remabledesigns.com}.
   */
  const random = function(min, max) {
    const argc = arguments.length;
    if (argc === 0) {
      min = 0;
      max = Math.pow(2, 31) - 1;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  return {
    random
  };
})();

/**
 * @desc custom promise request.
 * @param {options} options object contains url, headers to make http calls.
 * @returns {promise} promise.
 */
seatorder.request = (options) => {
  return new Promise(function(resolve, reject) {
    request(options, function(error, response, body) {
      !error ? resolve([response.statusCode, body]) : reject(error);
    });
  });
};

/**
 * @desc custom wait for milliseconds.
 * @param {integer} milliseconds milliseconds integer.
 */
seatorder.waitFor = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
seatorder.execShellCommand = cmd => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
};

/**
 * Executes a getInput and return it as a Promise.
 * @param question {string}
 * @return {Promise<string>}
 */
seatorder.askQuestion = function(question) {
  return new Promise(function(resolve, _reject) {
    const rl = readline.createInterface({
      input,
      output
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

/******************* @desc prototype extend *******************/

/**
 * @prototype
 * @desc htmlspecialchars is used to espace html special characters.
 */
Object.defineProperty(String.prototype, 'htmlspecialchars', {
  value: function() {
    const m = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '`': '&#x60;'
    };
    return this.replace(/[&<>"'`]/g, function(v) {
      return m[v];
    });
  }
});

/**
 * @prototype
 * @desc convert string to capitalize
 * {@link https://stackoverflow.com/questions/2332811/capitalize-words-in-string}.
 */
Object.defineProperty(String.prototype, 'toCapitalize', {
  value: function() {
    return this.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }
});

/**
 * @prototype
 * @desc convert first letter of string to capitalize
 * {@link https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript}.
 */
Object.defineProperty(String.prototype, 'toCapitalizeFirstLetterOnly', {
  value: function() {
    const s = this.toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
});

/**
 * @prototype
 * @desc this function is used to remove non digit characters simple reverse of toCurrency.
 */
Object.defineProperty(String.prototype, 'toNumber', {
  value: function() {
    let n = '';
    this.split('').forEach(function(val) {
      if (val === '.') {
        n += val;
        return;
      }
      if (!isNaN(val)) {
        n += val;
      }
    });
    n = this[0] === '-' ? '-' + n : n;
    return parseFloat(n);
  }
});

/**
 * @prototype
 * @desc replace multiple spaces with a single space.
 */
Object.defineProperty(String.prototype, 'reduceWhiteSpace', {
  value: function() {
    return this.replace(/\s\s+/g, ' ');
  }
});

/**
 * @prototype
 * @desc convert timestamp to js date, db timestamp in format `DD-MM-YYYY.HH:MM:SS`.
 */
Object.defineProperty(String.prototype, 'toJsDate', {
  value: function() {
    const regex = new RegExp(/^[0-9]{2}-[0-9]{2}-[0-9]{4}.[0-9]{2}:[0-9]{2}:[0-9]{2}$/);
    if (!regex.test(this)) throw new Error(`${this} is not in the format of seatorder timestamp`);

    const s = this.split('.');
    const d = s[0].split('-').map(Number);
    const t = s[1].split(':').map(Number);
    // `YYYY, MM, DD, HH, MM, SS`, JavaScript counts months from 0
    return new Date(d[2], d[1] - 1, d[0], t[0], t[1], t[2]);
  }
});

/**
 * @prototype
 * @desc used to trim if length exceededs length
 */
Object.defineProperty(String.prototype, 'toEllipsis', {
  value: function(len) {
    const dotc = 3;

    const _schema = {
      properties: {
        len: {
          required: true,
          type: 'integer',
          minimum: dotc + 1
        }
      }
    };
    const o = {
      len
    };
    const err = seatorder.jsonSchema.validate(_schema, o);
    if (err.length) throw new Error(JSON.stringify(err));

    if (this.length > len) {
      return this.substring(0, len - dotc) + '.'.repeat(dotc);
    } else {
      return this;
    }
  }
});

/**
 * @prototype
 * @desc used for dynamic template literals
 */
Object.defineProperty(String.prototype, 'interpolate', {
  value: function(object = {}) {
    const func = new Function(...Object.keys(object), `return \`${this}\`;`);
    return func(...Object.values(object));
  }
});

/**
 * @prototype
 * @desc get duration of js Date object.
 * @param {Object} end end date.
 * @returns {Array} array of duration.
 */
Object.defineProperty(Date.prototype, 'getDuration', {
  value: function(end = new Date()) {
    if (!(end instanceof Date)) throw new Error('argument is not Date object');

    const diff = moment.duration(moment(end).diff(moment(this)))._data;
    const arr = Object.keys(diff).reverse();
    arr.pop();
    const getType = type => {
      let r;
      switch (type) {
        case 'seconds':
          r = 'secs';
          break;
        case 'minutes':
          r = 'mins';
          break;
        case 'hours':
          r = 'hrs';
          break;
        case 'months':
          r = 'mons';
          break;
        default:
          r = type;
          break;
      }
      return r;
    };
    return arr.reduce((res, type, _index, _arr) => {
      if (diff[type]) res.push(diff[type] + ' ' + (diff[type] === 1 ? getType(type).slice(0, -1) : getType(type)));
      return res;
    }, []);
  }
});

/**
 * @prototype
 * @desc convert date object from one timezone to another.
 * @param {number} from from timezone offset value example +5:30 should be 330.
 * @param {number} to to timezone offset value.
 * @returns {Object} date object.
 */
Object.defineProperty(Date.prototype, 'toTimezone', {
  value: function(from, to = -new Date().getTimezoneOffset()) {
    const ms = this.getTime() - from * 6e4 + to * 6e4;
    return new Date(ms);
  }
});

/**
 * @prototype
 * @desc convert amount to curreny representator
 * {@link https://stackoverflow.com/questions/16037165/displaying-a-number-in-indian-format-using-javascript}.
 * {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString}.
 */
Object.defineProperty(Number.prototype, 'toCurrency', {
  value: function() {
    return '₹' + this.toLocaleString('en-IN');
  }
});

/**
 * @prototype
 * @desc find number of decimals
 * {@link https://stackoverflow.com/questions/17369098/simplest-way-of-getting-the-number-of-decimals-in-a-number-in-javascript}.
 */
Object.defineProperty(Number.prototype, 'countDecimals', {
  value: function() {
    if (Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split('.')[1].length || 0;
  }
});

/**
 * @prototype
 * @desc An simple module to convert numbers to words for South Asian numbering system. e.g. Two crore four lakh
 * {@link https://www.npmjs.com/package/num-words}.
 */
Object.defineProperty(Number.prototype, 'toWords', {
  value: function() {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const regex = /^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/;

    let num = Math.trunc(this);

    // does not support converting more than 9 digits yet
    if ((num = num.toString()).length > 9) throw new Error('overflow');

    const n = ('000000000' + num).substr(-9).match(regex);
    if (!n) return;

    let str = '';
    str += (n[1] !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';

    return str.trim();
  }
});

/**
 * @prototype
 * @desc custom async for each function.
 * @param {Function} cbk callback function for async forEach.
 */
Object.defineProperty(Array.prototype, 'asyncForEach', {
  value: async function(callbackFn, thisArg) {
    const len = this.length;
    for (let i = 0; i < len; i++) {
      await callbackFn.call(thisArg, this[i], i, this);
    }
  }
});

/**
 * @prototype
 * @desc custom async for each function.
 * @param {Function} cbk callback function for async map.
 */
Object.defineProperty(Array.prototype, 'asyncMap', {
  value: async function(callbackFn, thisArg) {
    const arr = [];
    const len = this.length;
    for (let i = 0; i < len; i++) {
      arr.push(await callbackFn.call(thisArg, this[i], i, this));
    }
    return arr;
  }
});

/**
 * @prototype
 * @desc this will remove duplicates and return new array.
 */
Object.defineProperty(Array.prototype, 'unique', {
  value: function() {
    return Array.from(new Set(this));
  }
});

/**
 * @prototype
 * @desc Array.prototype.flat() not implemented in chrome less than 69 verision.
 * @param {number} depth The depth level specifying how deep a nested array structure should be flattened. Defaults to 1.
 */
if (!Array.prototype.flat) {
  Object.defineProperty(Array.prototype, 'flat', {
    value: function(depth = 1) {
      if (typeof depth !== 'number') return this;
      depth = Math.trunc(depth);
      if (!depth) return this;
      return this.reduce(function(preVal, curVal) {
        return preVal.concat(Array.isArray(curVal) ? curVal.flat(depth - 1) : curVal);
      }, []);
    }
  });
}

module.exports = seatorder;
