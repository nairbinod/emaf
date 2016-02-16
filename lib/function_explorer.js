var h = require('./helper.js'),
	example = { id: '000000097',
  record_type: '300',
  date: '01302016',
  trasaction_type: '05',
  card: '441251******4722',
  network: 'VISA',
  amount: '130.00' }
	;

var isDate = function(date) {
	var month = h.parse(date,1,1+2),
		day = h.parse(date,3,3+2),
		year = h.parse(date,5,5+4);

	// console.log(year, month, day);

	return (new Date(date) !== "Invalid Date" ) ? true : false;
};


var formatDate = function(date) {
	var month = h.parse(date,1,1+2),
		day = h.parse(date,3,3+2),
		year = h.parse(date,5,5+4),
		date_string = year+'-'+month+'-'+day
		;
	return new Date(date_string).toISOString().slice(0,10);
};

var character_count = function(field){
	var result = field.length;

	return console.log(result);
};

var occurances = function(data,char){
	console.log( (data.match(new RegExp(char,'g') || []).length) );
};

// console.log(formatDate(example.date));
// isDate(example.date);

var txn_amount = 11500,
	txn_format = 'DDDDDDDDDCC',
	interchange = 280000000,
	interchange_format = 'DDDDDCCCCCCCCC'
	;

occurances(interchange_format,'C');



