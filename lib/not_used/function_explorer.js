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

// occurances(interchange_format,'C');

var draft_locator_type = function(draft_locator){
	var result = ''; 

	result = draft_locator.length

	return result;
	// return	 null;
	// h.parse(draft_locator, 2 , draft_locator.length - 3 -1 ) +':' + h.parse(draft_locator,draft_locator.length-2,3)
};

var line = '00001586330020001292016125800000000005   02940201 491239******3964   00000000003460900000034609000000000006513VISA D       7935100839 00081 0000000000024445006030000665893008                          ';

var draft_locator = h.parse(line,124,11);

var transferLogIdClassId = draft_locator_type(draft_locator);

console.log(draft_locator,transferLogIdClassId);

