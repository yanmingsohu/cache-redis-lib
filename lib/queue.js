module.exports = bind_fn;


function bind_fn(retObj, client, logger) {
  
  // 发送消息
  retObj.fsend = function(queue_name, value, fn) {
    client.RPUSH(queue_name, value, fn);
  };

  
  // 订阅消息
  retObj.fsubscribe = function(queue_name, fn) {
    var recver = retObj.createClient();
    var handle = {
      end: r_end,
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
        bindrecv();
      });
    }
  
    function r_end() {
      recver.end();
      recver = null;
    }
  };

}