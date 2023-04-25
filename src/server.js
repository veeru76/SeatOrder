'use strict';

// require packages
const cluster = require('cluster');
const http = require('http')

// require configs
const serverConfig = require('../config/server.js');

// require libraries
const debug = require('../lib/debug.js');
const app = require('./app.js');
const dbPoolObj = require('../lib/pool.js')

const server = {
    _server: null,
    _preInit: async function() {
      this._server = http.createServer(app);
    },

    // set up http server
    _init: function() {
      this._server = app.listen(serverConfig.port, () => {
        debug.server(`process id: ${process.pid} worker id: ${cluster.worker.id} started on port ${serverConfig.port}`);
      });
    },
    init: async function() {
      await this._preInit();
      this._init();
    },
    _preTerminate: async function() {
      // await websocketServerObj.terminate();
      // await redis.disconnect();
      await dbPoolObj.end();
    },
    // set up server terminate function
    _isRunning: false,
    terminate: async function() {
      if (!this._isRunning && (this._isRunning = true)) {
        debug.server(`process id: ${process.pid} terminating`);
        await this._preTerminate();
        this._server.close(() => {
          debug.server(`process id: ${process.pid} terminated`);
          process.exit(0);
        });
      } else {
        debug.server(`process id: ${process.pid} terminate function called twice so skipping it`);
      }
    }
  };
  
  // The SIGTERM signal is a generic signal used to cause program termination when using systemctl stop
  process.on('SIGTERM', async (signal) => {
    debug.process(`process id: ${process.pid} got signal: ${signal}`);
    await server.terminate();
  });
  
  // The SIGINT signal is a program interrupt triggered by the user when pressing ctrl-c
  process.on('SIGINT', async (signal) => {
    debug.process(`process id: ${process.pid} got signal: ${signal}`);
    await server.terminate();
  });
  
  // The SIGQUIT signal is similar to SIGINT, except that it’s controlled by a different key—the QUIT character, usually ctrl-\
  process.on('SIGQUIT', async (signal) => {
    debug.process(`process id: ${process.pid} got signal: ${signal}`);
    await server.terminate();
  });
  
  // uncaughtException signal
  process.on('uncaughtException', async (err, origin) => {
    debug.process(`process id: ${process.pid} uncaughtException at: ${origin} err: ${err}`);
    await server.terminate();
  });
  
  // unhandledRejection signal
  process.on('unhandledRejection', async (reason, promise) => {
    debug.process(`process id: ${process.pid} Unhandled Rejection at:`, promise, 'reason:', reason);
    await server.terminate();
  });
  
  // The exit signal event is emitted when the Node.js process is about to exit
  process.on('exit', (code) => {
    debug.process(`process id: ${process.pid} exit event with code: ${code}`);
  });
  
  server.init();
  