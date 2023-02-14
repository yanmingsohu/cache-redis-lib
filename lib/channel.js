module.exports = bind_fn;


function bind_fn(retObj, client, logger) {

  retObj.tsend = function(channel, msg, fn) {
    client.publish(channel, msg, fn);
  };

  retObj.tsubcount = function(channel, fn) {
    subcount('NUMSUB', channel, fn);
  };

  retObj.tsubscribe = function(channel, fn) {
    return create_subscribe(
      channel, fn, 'subscribe', 'message', 'NUMSUB', 'unsubscribe');
  };

  // 匹配模式

  retObj.tpsubcount = function(channel, fn) {
    subcount('NUMPAT', channel, fn);
  };

  retObj.tpsubscribe = function(channel, fn) {
    return create_subscribe(
      channel, fn, 'psubscribe', 'pmessage', 'NUMPAT', 'punsubscribe');
  };


  function subcount(type, channel, fn) {
    client.pubsub(type, channel, function(err, ret) {
      if (err)
        fn(err);
      else
        fn(null, ret[1]);
    });
  }


  function create_subscribe(channel, fn, fnn_sub, msg_n, cnt_n, fnn_unsub) {
    var handle = {
      end   : _end,
      count : _count,
      pause : _pause,
      start : _start,
    };

    var suspend = 1;
    var sub = retObj; // retObj.createClient();
    sub.on(msg_n, (('subscribe' == fnn_sub) ? _recv : _recvp));
    _start();

    return handle;


    function _recv(channel, message) {
      fn(null, message, channel);
    }

    function _recvp(pattern, _channel, message) {
      fn(null, message, _channel, pattern);
    }

    function _end() {
      if (sub) {
        sub.quit();
        sub = null;
      }
    }

    function _count(cb) {
      subcount(cnt_n, channel, cb);
    }

    function _pause() {
      if (!suspend) {
        sub[fnn_unsub](channel);
        suspend = 1;
      }
    }

    function _start() {
      if (suspend) {
        sub[fnn_sub](channel);
        suspend = 0;
      }
    }
  }
}
