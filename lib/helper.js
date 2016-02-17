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
		default: 
			return null;
	}
};

var draft_locator = function(draft_locator){
	var result = '',
		id = draft_locator.substring(0,draft_locator.length - 3),
		classId = draft_locator.substring(draft_locator.length - 3 );

	result = id +':'+ classId;

	return result;
};




/* Export functions */
exports.parse 		= parse;
exports.search 		= search;
exports.date 			= date;
exports.transaction_type = transaction_type;
exports.network = network;
exports.draft_locator = draft_locator;
