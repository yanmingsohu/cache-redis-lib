var redis 		= require("../index.js");
var punycode 	= require('punycode');
var assert 		= require('assert');


var client = redis.createClient();
test1(function() {
	test2(function() {
		process.exit(0);
	});
});


function test2(next) {
	var json = {a:1, b:2, c:[1,2,3]};
	var key = 'test json';

	client.setJSON(key, json, function() {
		console.log('set json over');

		client.getJSON(key, function(data) {
			console.log('get json over', data);
			assert.deepEqual(data, json);
			next && next();
		});
	});
}


function test1(next) {
	var key = 'test key';
	var val = '3297395835345';

	client.set(key, val, function() {
		console.log('set over');

		client.get(key, function(d) {
			console.log('get over', d);
			assert.equal(d, val);
			next && next();
		});
	});
}