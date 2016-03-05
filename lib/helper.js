var fs 				= require('fs')
	;

/* Helper functions */
var search = function(type, search_term, test){
	switch (type) {
		case 'boolean_search': 
			return boolean_search(search_term, test);
		case 'regex_search':
			return regex_search(search_term, test);
	}
};

var boolean_search = function(search_term, test){
	try {
		return ~test.indexOf(search_term) ? true : false;
	} catch	(e) {
		return false;
	}
};

var regex_search = function(search_term, test){
	var re = new RegExp(search_term,'i');
	return re.test(test) ? true : false;
};

var parse = function(line, start, length) {
	var tempArray = []
		,	parsed = [];

	for (i = (start -1); i < ( (start+length) - 1) ; i++) {
		tempArray.push(line[i]);
		parsed = tempArray.join('');
	}

	return parsed.trim();
};

var date = function(date) {
	var month = parse(date,1,2),
		day = parse(date,3,2),
		year = parse(date,5,4),
		date_string = year+'-'+month+'-'+day
		;
	return new Date(date_string).toISOString().slice(0,10);
};

var transaction_type = function(transaction_type_code){
	// Table 100.4 eMaf Spec
	switch(transaction_type_code){
		case '05':
			return 'Gross';
		case '06':
			return 'Refund';
		default:
			return null;
	}
};

var issuer_type = function(Qualification_Code) {
	var Intl_Regex = /INTL/gi,
		International_Regex = /International/gi,
		Interregional_Regex = /Interregional/gi
	;

	if ( Intl_Regex.test(Qualification_Code) || International_Regex.test(Qualification_Code) || Interregional_Regex.test(Qualification_Code) ) {
		return 'International';
	} else {
		return 'Domestic';
	}
};

var network = function(network){
	// Table 100.14 eMaf Spec
	switch(network){
		case 'VISA':
			return 'Visa';
		case 'MCRD':
			return 'Mastercard';
		case 'AMEX':
			return 'Amex';
		case 'DISC':
			return 'Discover';
		default: return null;
	}
};

var draft_locator = function(draft_locator){
	var result = '',
		id = parseInt(draft_locator.substring(0,draft_locator.length - 3)),
		classId = parseInt(draft_locator.substring(draft_locator.length - 3));

	result = id +':'+ classId;

	return result;
};

var card_type = function(interchange_qualifcation){
	var Debit = /debit/gi,
		Prepaid = /prepaid/gi
		;

	if (Debit.test(interchange_qualifcation) || Prepaid.test(interchange_qualifcation) ) {
		return 'Debit';
	} else { 
		return 'Credit';
	}
};

var assessments = function(transaction_type, network, card_type, txn_amount){
	if(transaction_type == 'Refund') return 0;

	txn_amount = parseFloat(txn_amount);

	// console.log(transaction_type,network,card_type,txn_amount);

	switch(network){
		case 'Visa':
			switch(true){
				case card_type == 'Credit': 	return txn_amount * (0.13 * 0.01); // Visa Assessment Fee Sig Credit
				case card_type == 'Debit': 		return txn_amount * (0.11 * 0.01); // Visa Assessment Fee Sig Debit
				default: return 0;
			}
		case 'Mastercard':
			switch(true){
				case txn_amount < 999: 				return txn_amount * ((0.12 + 0.0076) * 0.01); 	// MC Assessment Fee + MC Acquirer Fee
				case txn_amount >= 1000: 			return txn_amount * ((0.13 + 0.0076) * 0.01); // MC Assessment $1000 & Over + MC Acquirer Fee
				default: return 0;
			}
		case 'Discover':  								return txn_amount * (0.11 * 0.01);  // 0.11% = Discover Assessment Fee
		default: return 0;
	}
};



var cross_border = function(transaction_type, network, txn_amount){
	if(transaction_type == 'Refund') return 0;

	txn_amount = parseFloat(txn_amount);

	// console.log(transaction_type, network, txn_amount);
	// console.log('INTL',network, txn_amount, txn_amount*(0.45+0.80) );

	switch(network){
		case 'Visa': 				return txn_amount * ((0.45 + 0.80) * 0.01); // Visa IAF + Visa ISA
		case 'Mastercard': 	return txn_amount * ((0.60 + 0.85) * 0.01); // MC Cross Border + MC Program Support
		case 'Discover': 		return txn_amount * ((0.40 + 0.55) * 0.01); // DS Intl Proc Fee + DS Svc Fee
		default: return 0;
	}
};

var surcharge = function(transaction_type, issuer_type, network, txn_amount){
	switch(issuer_type){
		case 'International':
			return cross_border(transaction_type, network, txn_amount);		
		case 'Domestic':
			return 0;
	}
};




/* Export functions */
exports.parse 		= parse;
exports.search 		= search;
exports.date 			= date;
exports.transaction_type = transaction_type;
exports.network = network;
exports.issuer_type = issuer_type;
exports.card_type = card_type;
exports.draft_locator = draft_locator;
exports.assessments = assessments;
exports.surcharge = surcharge;



