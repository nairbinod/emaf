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

var parse = function(line, start, finish) {
	var tempArray = []
		,	parsed = [];

	for (i = (start -1); i < (finish -1); i++) {
		tempArray.push(line[i]);
		parsed = tempArray.join('');
	}
	return parsed.trim();
};

var date = function(date) {
	var month = parse(date,1,1+2),
		day = parse(date,3,3+2),
		year = parse(date,5,5+4),
		date_string = year+'-'+month+'-'+day
		;
	return new Date(date_string).toISOString().slice(0,10);
};


/* Export functions */
exports.parse 		= parse;
exports.search 		= search;
exports.date 			= date;
