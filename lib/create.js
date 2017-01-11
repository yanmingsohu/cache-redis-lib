var logger = require('logger-lib')('redis');
var clib   = require('configuration-lib');

var default_retry_time = 15000;

module.exports = createClient;


function createClient(_ext_conf) {
  var redis   = require("redis");
  var closed  = false;
  var client  = null;
  var sub_cli = [];
  var _conf   = clib.load().redis_conf || {};
  var retObj  = {
    createClient : _createClient,
    end          : _end,
    close        : _end,
  };

  if (_ext_conf) {
    for (var n in _ext_conf) {
      _conf[n] = _ext_conf[n];
    }
  }

  if (!_conf.options) {
    _conf.options = {};
  }

  if (!_conf.options.retry_strategy) {
    _conf.options.retry_strategy = default_retry_strategy;
  }

  _connect_server();
  require('./basic.js')(retObj, client, logger);
  require('./queue.js')(retObj, client, logger);
  require('./channel.js')(retObj, client, logger);

return retObj;


  function _connect_server() {
    if (_conf.stream) {
      client = new redis.RedisClient(_conf.options, _conf.stream);
    } else {
      client = redis.createClient(
                _conf.port,
                _conf.host,
                _conf.options );
    }

    client.on("error", function (err) {
      logger.debug(err);
    });

    if (isNaN(_conf.db)) {
      showLink();
    } else {
      client.select(_conf.db, showLink);
    }

    function showLink() {
      logger.debug('Connect to', _conf.host,
                   ':', _conf.port,
                   'use db:', _conf.db || 0);
    }
  }

  function default_retry_strategy() {
    if (closed) return;
    logger.debug('与服务器的连接断开', default_retry_time/1000, '秒后重试');
    return default_retry_time;
  }

  function _createClient() {
    if (closed) return;
    var link = createClient(_ext_conf);
    sub_cli.push(link);
    return link;
  }

  function _end() {
    if (closed) return;
    closed = true;
    client && client.quit();
    for (var i=sub_cli.length-1; i>=0; --i) {
      sub_cli[i].end();
    }
    sub_cli = null;
  };
}
