var redis = require("../");


for (var i=0; i<2; ++i) {
  //testGroup(i);
  testQueue(i);
}
testChannel();


// 通道消息
function testChannel() {
  var name = 'he';
  var client = redis.createClient();
  var cli2   = redis.createClient();

  cli2.tsubcount(name, function(a,b) {
    console.log(a,b);
  });

  var handle = cli2.tsubscribe(name, function(err, msg) {
    console.log('c recv', err || msg);
  });

  var a = 0;
  var tid = setInterval(function() {
    console.log('c send', name, a);
    client.tsend(name, a);
    ++a;
    if (a >= 10) {
      handle.end();
      clearInterval(tid);
      client.end();
      return;
    }
    if (a %2 == 0) {
      handle.pause();
    } else {
      handle.start();
    }
  }, 100);
}


// 使用定义好的队列消息函数
function testQueue(msg) {
  var client = redis.createClient();
  var recvc  = redis.createClient();
  var name = 'aa' + msg;

  var handle = recvc.fsubscribe(name, function(err, d) {
    if (err) {
      console.log('q', name, "E:", err);
    } else {
      console.log('q', name, "D:", d);
    }
  });

  var a = 1;
  var tid = setInterval(function() {
    console.log('q send', name, a);
    client.fsend(name, a);
    if (++a > 10) {
      clearInterval(tid);
      client.end();
      handle.end();
    }
  }, 200);
}


// 使用命令模拟消息
function testGroup(msg) {
  var csend = redis.createClient();
  var crecv = redis.createClient();
  a1();

  function a1() {
    waitfor('a' + msg, a1);
  }

  function waitfor(name, next) {
    crecv.BLPOP(name, 0, function(err, d) {
      if (err) {
        console.log(name, "E:", err);
      } else {
        console.log(name, "D:", d);
      }
      next && next(err, d);
    });
  }

  var a = 1;
  setInterval(function() {
    console.log('send', msg , a);
    csend.RPUSH('a' + msg, a, function(e) {
      e && console.log(e);
    });
    csend.RPUSH('a' + msg, 'b'+a, function(e) {
      e && console.log(e);
    });
    ++a;
  }, 5000+a*100);
}
