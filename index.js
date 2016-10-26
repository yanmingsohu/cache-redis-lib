var logger = require('logger-lib')('redis');
var clib   = require('configuration-lib');


module.exports.createClient = require('./lib/create.js');
