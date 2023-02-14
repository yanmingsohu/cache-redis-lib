var cache = require('../');
var net = require('net');


var socket = net.connect(6379, 'localhost');
var rc = 0;

//
// 如何正确的在 stream 参数中进行重试
//
var ext_conf = {
  stream : socket,
  options: {
    retry_strategy: function() { return 1; },
  },
};


var client = cache.createClient(ext_conf);
testData(client);


client.on('reconnecting', function(conf) {
  if (rc > 2) return client.end();
  console.log('2. retry', ++rc);
  socket.connect(6379, 'localhost');
});


client.on('connect', function() {
  console.log('3. connect')
  timeoutClose();
});


client.on('quit', function() {
  console.log('END');
  process.exit();
});


function log(a, b) {
  if (a) {
    console.error('\t', log.caller.name, "fail:", a);
  } else if (b) {
    console.log('\t', log.caller.name, 'DATA:', b);
  } else {
    console.log('\t', log.caller.name, 'ok');
  }
}


function testData(client) {
  var c = 1, a;

  setInterval(function() {
    console.log('    ---- Do Redis command ----')
    if (c) {
      a = parseInt(Math.random()*100000);
      client.SET('abc', a, function SET(err) {
        log(err, a);
      });
    } else {
      client.GET('abc', function GET(err, d) {
        log(err, d);
        if (parseInt(d) !== a) {
          console.log('   ----------- FAIL: ' + d + ' ' + a);
        }
      });
    }
    c = 1 ^ c;
  }, 300);
}


function timeoutClose() {
  setTimeout(function() {
    console.log('1. close');
    socket.destroy();
  }, 1500);
}
