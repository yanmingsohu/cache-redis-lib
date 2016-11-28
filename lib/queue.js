module.exports = bind_fn;


function bind_fn(retObj, client, logger) {
  
  // 发送消息
  retObj.fsend = function(queue_name, value, fn) {
    client.RPUSH(queue_name, value, fn);
  };

  
  // 订阅消息
  retObj.fsubscribe = function(queue_name, fn) {
    var recver = retObj.createClient();
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
            fn(err);
          } else {
            fn(null, d[1], d[0]);
          }
        } catch(e) {
          client.emit('error', e);
        }
        if (!suspend) {
          bindrecv();
        } else {
          suspend = 2;
        }
      });
    }
  
    function _start() {
      if (suspend == 2) {
        bindrecv();
        suspend = 0;
      }
    }
  
    function r_end() {
      if (recver) {
        recver.quit();
        recver = null;
      }
    }
  
    function _pause() {
      suspend = 1;
    }
  };

}