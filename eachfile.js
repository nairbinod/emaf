var fs = require('fs'), path = require('path'),	h = require('./lib/helper.js'), psql = require('./lib/config/database.js'),
	fileName = 'emaf.masked.txt', file = path.join('./data', fileName),
	stream = fs.createReadStream(file), rl = require('readline').createInterface({ input: stream }),