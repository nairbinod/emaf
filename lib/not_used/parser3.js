var fs = require('fs'),
	path = require('path'),
	h = require('./lib/helper.js'),
	fileName = 'sample.emaf.txt',
	file = path.join('./data', fileName),
	stream = fs.createReadStream(file),
	rl = require('readline').createInterface({ input: stream })
	;

var result = {
		id: null,
		record_type: null,
		date: null,
		card: null,
		network: null,
		amount: null,
		interchange_amt: null,
		surcharge_amt: null
	},
	data = [];

rl.on('line', function(line){
	line_type(line);
});

rl.on('close',function(){
	console.log(data);
});

var valid = function(line){
	return line_type(line);
};

var line_type = function(line, cb){
	/* 
		eMAF file spec v5.3
	*/
	var record_sequence_number = h.parse(line,1,1+9),
		record_type_identifier = h.parse(line,10,10+3),
		description = ''
		;

	switch(true){
		case record_type_identifier == 300:
			description = 'credit reconciliation transaction 1';
			break;
		case record_type_identifier == 301:
			description = 'credit reconciliation transaction 2';
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
			credit_reconciliation_transaction_1(line, cb); break;
		case 'credit reconciliation transaction 2':
			credit_reconciliation_transaction_2(line, cb); break;
		case 'settlement detail':
		case 'settlement summary':
			break;
		default:
			break;
	}

};

var new_record = function(){
	result = {};
};

var credit_reconciliation_transaction_1 = function(line, cb){
	var record_sequence_number = h.parse(line,1,9),
		record_type_identifier = h.parse(line,10,3),
		transaction_date = h.parse(line,16,8),
		record_length = h.parse(line,13,3),
		transaction_type_code = h.parse(line,37,2),
		card_number = h.parse(line,51,19),
		network = h.parse(line,111,4),
		txn_amount = parseFloat(h.parse(line,74,11) * 0.01).toFixed(2),
		mcc = h.parse(line,107,4),
		reserved = h.parse(line,118,6),
		draft_locator = h.parse(line,124,11),
		batch_number = h.parse(line,135,6),
		network_reference_number = h.parse(line,152,24)
	;

	new_record();

	result.id = record_sequence_number;
	result.record_type = record_type_identifier;
	result.date = h.date(transaction_date);
	result.card = card_number;
	result.network = network;
	result.amount = txn_amount;
	result.mcc = mcc;

	result.reserved = reserved;
	result.draft_locator = draft_locator;
	result.batch_number = batch_number;
	result.network_reference_number = network_reference_number;

	// cb();
};


var credit_reconciliation_transaction_2 = function(line, cb){
	var record_sequence_number = h.parse(line,1,9),
		record_type_identifier = h.parse(line,10,3),

		// interchange_indicator = h.parse(line,50,50+2),
		// interchange_code = h.parse(line,52,52+9),
		interchange_amt = parseFloat(h.parse(line,61,14)* 0.000000001).toFixed(2),
		interchange_sign = h.parse(line,75,1),
		// surcharge_reason = h.parse(line,76,76+3),
		surcharge_amt = parseFloat(h.parse(line,79,8)* 0.01).toFixed(2),
		visa_id = h.parse(line,88,15)
	;

	// result = {
	// 	id: record_sequence_number,
	// 	record_type: record_type_identifier,
	// 	interchange_amt: interchange_sign + interchange_amt,
	// 	surcharge_amt: interchange_sign + surcharge_amt
	// };

	result.id = record_sequence_number;
	result.record_type = record_type_identifier;
	result.interchange_amt = interchange_sign + interchange_amt;
	result.surcharge_amt = interchange_sign + surcharge_amt;

	data.push(result);

};



