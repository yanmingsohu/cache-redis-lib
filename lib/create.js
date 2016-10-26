var logger = require('logger-lib')('redis');
var clib   = require('configuration-lib');


module.exports = createClient;


var redis_conf = clib.load().redis_conf;
var retry_time = 15000;


function createClient(_ext_conf) {
  var redis   = require("redis");
  var closed  = false;
  var client  = null;
  var _conf;
  var retObj  = { 
    createClient: _createClient,
    end: _end,
  };


  if (_ext_conf) {
    _conf = clib.extends(redis_conf, _ext_conf);
  } else {
    _conf = redis_conf;
  }
  if (!_conf.options) {
    _conf.options = {};
  }
  if (!_conf.options.retry_strategy) {
    _conf.options.retry_strategy = retry_strategy;
  }

  _connect_server();
  require('./basic.js')(retObj, client, logger);
  require('./queue.js')(retObj, client, logger);
  require('./channel.js')(retObj, client, logger);

return retObj;


  function _connect_server() {
    client = redis.createClient(
              _conf.port, 
              _conf.host, 
              _conf.options );

    client.on("error", function (err) {
      logger.debug(err);
    });
  
    client.select(_conf.db, function(err, ret) {
      logger.debug('Connect to', _conf.host, 
                   ':', _conf.port, 
                   'use db:', _conf.db);
    });
  }

  function retry_strategy() {
    if (closed) return;
    logger.debug('与服务器的连接断开', retry_time/1000, '秒后重试');
    return retry_time;
  }

  function _createClient() {
    return createClient(_ext_conf);
  }

  function _end() {
    closed = true;
    client && client.end();
  };
}

