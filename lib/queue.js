module.exports = bind_fn;


function bind_fn(retObj, client, logger) {

  // 发送消息
  retObj.fsend = function(queue_name, value, fn) {
    client.RPUSH(queue_name, value, fn);
  };


  // 订阅消息
  retObj.fsubscribe = function(queue_name, fn) {
    var recver = retObj; // .createClient();
    var suspend = 0;

    var handle = {
      end   : r_end,
      pause : _pause,
      start : _start,
    };

    bindrecv();
    return handle;

    function bindrecv() {
      recver.BLPOP(queue_name, 0, function(err, d) {
        try {
          if (err) {
            suspend = 1;
            fn(err);
          } else {
            fn(null, d[1], d[0]);
          }
        } catch(e) {
          suspend = 1;
          client.emit('error', e);
        }
        if (!suspend) {
          setImmediate(bindrecv);
        }
      });
    }

    function _start() {
      if (suspend) {
        bindrecv();
        suspend = 0;
      }
    }

    function r_end() {
      if (recver) {
        recver.quit();
      }
    }

    function _pause() {
      suspend = 1;
    }
  };

}
