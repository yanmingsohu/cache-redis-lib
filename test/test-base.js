var redis = require("./index.js");
var client = redis.createClient();
var punycode = require('punycode');
//require('buffer');


client.on("error", function (err) {
    console.log("Error " + err);
});

var id = 'dsScheduleCache:a297dfacd7a84eab9656675f61750078:'
		+'b67f8ef6e39f4fdb84d6d442f3653ff6';

client.get(id, function(err, reply) {
//     // reply is null when the key is missing
    console.log('org >>> ', err, reply);
//     // return;

//     var strarr = punycode.ucs2.decode(reply) ;
//     console.log('arr >>> ', strarr);

//     // var buf = new Buffer(strarr);
//     // console.log('str >>> ', buf.toString());

//     //console.log(err, reply);
});


client.KEYS("dsScheduleCache*", 
	function(err, reply) {
    // reply is null when the key is missing
    var str = punycode.ucs2.decode(reply) ;
    console.log('str >>> ', str);
    // var data = JSON.parse(reply);
    //console.log('search >>> ', data);
});


client.mset("missingkey", {a:1}, function(err, d) {
	   console.log(err, d);
});

client.select(0);

client.DBSIZE(function(err, d) {
	console.log('DBSIZE', err,d);
});

client.KEYS('dsApi*', function(err, k) {
	console.log();
	console.log('KEYS', err, k);
  
	// client.mget(k, function(e, d) {
	// 	console.log("\t", e, d);
	// });
});

var count = 3;
setInterval(function() {
	client.MONITOR(function(err, d) {
		console.log(err,d);
	});
  if (--count < 0) {
    client.quit();
    process.exit();
  }
}, 1000);
