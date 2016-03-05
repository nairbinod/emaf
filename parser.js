var fs = require('fs'), path = require('path'),	h = require('./lib/helper.js'), i = require('./lib/interchange_code.js'), psql = require('./lib/config/database.js'),
	fileDir = './data/masked_test',
	result = {	id: null	}, merchant = { merchant_id: null },
	data = [], final_data = [], imprt = false
	;

var sql = 'insert into interchange('+
    ' Date, Merchant_Id, Merchant_Name, Network, Transaction_Type, Issuer_Type,'+ 
    ' Draft_Locator, MCC, Card_Number, ' +
    ' Txn_Amount, Interchange, Surcharge) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)';

/* 
	Extract Function Expression definition at the top due to  hoisting
*/ 
var extract = function(file,cb){
	var stream = fs.createReadStream(file), rl = require('readline').createInterface({ input: stream })	
		;

	rl.on('line', function(line){
		line_type(line);
	});

	rl.on('close',function(){
		cb(data);
	});
};



/* 
	Script begins here
*/ 
fs.readdir(fileDir, function(err,files){
	return files.map(function(file,iterator){
		return extract(path.join(fileDir,file),function(arr,cb){
			transform(arr,function(data){
				if(imprt) { psql.connect(); load(data); }
				// console.log(data);
				console.log('done');
			});
		});
	});
});



/*
	Function Expression definitions
*/
var transform = function(arr, cb){
	var data = [];
	arr.map(function(item,iterator){
		var row = [];
		
		row.push(item['date'], item['merchant_id'], item['merchant_name'],item['network'],item['transaction_type'],item['issuer_type'],item['card_type'],
			item['draft_locator'], item['mcc'], item['card_number'], item['interchange_code'], item['interchange_qualification'],
			item['txn_amount'], item['interchange'], item['assessments'], item['surcharge'] , item['total_fees']);

		data.push(row);		
	});

	cb(data);
};

var load = function(data){
	data.map(function(item,index){
		psql.query(sql, item, function(err,result){
			if(err) console.log(err);
		});
	});
};

var line_type = function(line, cb){
	/* 
		eMAF file spec v5.3
	*/
	var record_sequence_number = h.parse(line,1,9),
		record_type_identifier = h.parse(line,10,3),
		description = ''
		;

	switch(true){
		case record_type_identifier == 300:
			description = 'credit reconciliation transaction 1';
			break;
		case record_type_identifier == 301:
			description = 'credit reconciliation transaction 2';
			break;
		case record_type_identifier == 70:
			description = 'mid 1';
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
		case 'mid 1':
			mid_1(line, cb); break;			
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

var new_merchant = function(){
	merchant = {};
};

var mid_1 = function(line, cb){
	var merchant_account_number = h.parse(line,18,16),
		division_number = h.parse(line,50,3),
		store = h.parse(line,53,9),
		merchant_name = h.parse(line,62,25)
	;
	new_merchant();

	merchant.merchant_id = merchant_account_number;
	merchant.division = division_number;
	merchant.store = store;
	merchant.merchant_name = merchant_name;
	// cb();
};

var credit_reconciliation_transaction_1 = function(line, cb){
	var record_sequence_number = h.parse(line,1,9),
		record_type_identifier = h.parse(line,10,3),
		transaction_date = h.parse(line,16,8),
		record_length = h.parse(line,13,3),
		transaction_type_code = h.parse(line,37,2), // table 100.4
		transaction_type = h.transaction_type(transaction_type_code),
		card_number = h.parse(line,51,19),
		network = h.parse(line,111,4), // table 100.14
		// card_type = h.parse(line,115,3), //table 100.31
		txn_amount = parseFloat(h.parse(line,74,11) * 0.01).toFixed(2),
		mcc = h.parse(line,107,4),
		txn_amount_sign = function(transaction_type) { return transaction_type === 'Gross' ? '+' : '-' };
		draft_locator = h.draft_locator(h.parse(line,124,11))

	;

	new_record();

// console.log(
// 	record_sequence_number, record_type_identifier , transaction_type, draft_locator
// 	);

	// console.log(result.network, h.network(network));

	result.id = record_sequence_number;
	result.date = h.date(transaction_date);
	result.merchant_id = merchant.merchant_id;
	result.merchant_name = merchant.merchant_name;
	result.network = h.network(network);
	result.network_code = network;
	result.transaction_type = transaction_type;
	result.mcc = mcc;
	result.draft_locator = draft_locator;
	result.card_number = card_number;
	result.txn_amount = txn_amount_sign(transaction_type) + txn_amount;

	// cb();
};

var credit_reconciliation_transaction_2 = function(line, cb){
	var record_sequence_number = h.parse(line,1,9),
		interchange_amt = parseFloat(h.parse(line,61,14)* 0.000000001).toFixed(2),
		interchange_sign = h.parse(line,75,1),
		emaf_surcharge_amt = parseFloat(h.parse(line,79,8)* 0.01).toFixed(2),
		interchange_code = h.parse(line,52,9),
		interchange_qualification = i.interchange_qualification(result.network, parseInt(h.parse(line,52,9))), // table 100.29
		card_type = h.card_type(interchange_qualification);
		issuer_type = h.issuer_type(interchange_qualification),
		assessments = h.assessments(result.transaction_type, result.network , card_type , result.txn_amount),
		surcharge = h.surcharge(result.transaction_type, issuer_type, result.network, result.txn_amount)
	;

	// console.log(result.network, result.interchange_qualification);

	result.id = record_sequence_number;
	result.card_type = card_type;
	result.interchange = interchange_sign + interchange_amt;
	result.interchange_code = interchange_code;
	result.issuer_type = issuer_type;
	result.interchange_qualification = interchange_qualification;
	result.assessments = interchange_sign + assessments;
	result.surcharge = interchange_sign + surcharge;
	result.total_fees = ( parseFloat(result.interchange) - (assessments) - (surcharge) );

	console.log(result);


	// console.log(record_sequence_number,interchange_code,interchange_qualification)

	data.push(result);
};



