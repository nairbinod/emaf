var fs = require('fs'),
	path = require('path'),
	h = require('./lib/helper.js'),
	fileName = 'sample.emaf.txt',
	file = path.join('./data', fileName),
	stream = fs.createReadStream(file),
	rl = require('readline').createInterface({ input: stream }),
	result = {}
	;

rl.on('line', function(line){
	if( valid(line) ){
		transform(line, function(){
			console.log(result);
		});
	}
});

var valid = function(line){
	return line_type(line);
};

var line_type = function(line){
	/* 
		eMAF file spec v5.3
	*/
	var record_sequence_number = h.parse(line,1,1+9),
		record_type_identifier = h.parse(line,10,10+3),
		description = ''
		;

	switch(true){
		case record_type_identifier == 300 || record_type_identifier == 300:
			description = 'credit reconciliation transaction 1';
			break;
		case record_type_identifier >= 100 && record_type_identifier <= 300:
			description = 'settlement detail';
			break;
		case record_type_identifier >= 500 && record_type_identifier <= 519:
			description = 'settlement summary';
			break;
		default:
			return false;
	}

	switch(description){
		case 'credit reconciliation transaction 1':
			return true;
		case 'settlement detail':
		case 'settlement summary':
			return false;
		default:
			return false;
	}

};

var transform = function(line, cb){
	var record_sequence_number = h.parse(line,1,1+9),
		record_type_identifier = h.parse(line,10,10+3),
		transaction_date = h.parse(line,16,16+8),
		record_length = h.parse(line,13,13+3),
		transaction_type_code = h.parse(line,37,37+2),
		card_number = h.parse(line,51,51+19),
		network = h.parse(line,111,111+4),
		txn_amount = parseFloat(h.parse(line,74,74+11) * 0.01).toFixed(2)
	;

	result = {
		id: record_sequence_number,
		record_type: record_type_identifier,
		date: h.date(transaction_date),
		card: card_number,
		network: network,
		amount: txn_amount
	};


	cb();
};




