var redis = require("../");


for (var i=0; i<2; ++i) {
  //testGroup(i);
  testQueue(i);
}

// 使用定义好的消息函数
function testQueue(msg) {
  var client = redis.createClient();
  var name = 'aa' + msg;
  
  var handle = client.fsubscribe(name, function(err, d) {
    if (err) {
      console.log(name, "E:", err);
    } else {
      console.log(name, "D:", d);
    }
  });
  
  var a = 1;
  setInterval(function() {
    console.log('send', name, a);
    client.fsend(name, a);
    ++a;
  }, 2000); 
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