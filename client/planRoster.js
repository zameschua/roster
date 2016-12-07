/*
Warning!
This page is NOT mobile friendly!
*/

import { Template } from 'meteor/templating';
 
import './planRoster.html';
import { RosterDataCollection } from '/imports/api/RosterDataCollection';

// Temporary global variable to refer to HandsOnTable in template.events
var hot = "";
var today = new Date();
var nextYear = today.getFullYear(); // Year of the next month
var nextMonth = (today.getMonth() + 1) % 12; // NOTE: Jan is 0, Dec is 11. Follows Javascript's Date object implementation
if (nextMonth == 0) { // If month is in december, nextYear will be the next year
	nextYear += 1; 
}
var daysInNextMonth = daysInMonth(nextYear, nextMonth);
var weekends = getWeekends(nextYear, nextMonth, daysInNextMonth);

Template.planRoster.helpers({
	// Show additional menu items if user is admin
	admin: function() {
		return Roles.userIsInRole(Meteor.userId(), 'admin');
	}
});

Template.planRoster.events({
	'click #load-btn': function() {
		var data = RosterDataCollection.findOne().year.month;

		console.log(JSON.stringify(data)); // Fix this tmr!!
		hot.loadData(data.data);
	},
	'click #save-btn': function() {
		var data = {data: hot.getData()};
		console.log(data);
		Meteor.call('insertData', nextYear, nextMonth, data);
		console.log("Data saved!");
	},
});

// Using handsontable for the excel-table
// Docs:  https://docs.handsontable.com/pro/1.8.0/tutorial-introduction.html
Template.excelTable.rendered = function() {
	// Get the next month
	var today = new Date();
	var nextYear = today.getFullYear(); // Year of the next month
	var nextMonth = (today.getMonth() + 1) % 12; // NOTE: Jan is 0, Dec is 11. Follows Javascript's Date object implementation
	if (nextMonth == 0) { // If month is in december, nextYear will be the next year
		nextYear += 1; 
	}
	var daysInNextMonth = daysInMonth(nextYear, nextMonth);
	var weekends = getWeekends(nextYear, nextMonth, daysInNextMonth);

	// Remove later!
	console.log("year");
	console.log(nextYear);
	console.log("month");
	console.log(nextMonth);
	console.log(weekends);

	// Generate data to be displayed
	var excelData = generateData(daysInNextMonth);

	var colHeaders = generateColHeaders(daysInNextMonth);
	var colSchema = generateColSchema(daysInNextMonth);

	// Initialise HandsOnTable
	var container = document.getElementById('excel-table');
	var excelTable = new Handsontable(container, {
	    data: excelData,
	    colHeaders: colHeaders,
	    columns: colSchema,
	    contextMenu: true,
	    fixedColumnsLeft: 1, // Fixed names column
	    fixedRowsTop: 1, // Fixed dates row
	    manualColumnResize: true,
	    manualRowResize: true,
	    copyPaste: true,
	    colWidths: function(col) {
	    	if (col === 0) {
	    		return 120; // Width of first column
	    	} else {
	    		return 35; // Width of the other columns
	    	}
	    },
	    cells: function(row, col, prop) {
	    	var cellProperties = {};

	    	// Color all weekends grey
	    	if ($.inArray(col, weekends) >= 0) {
		        cellProperties.readOnly = true; // make cell read-only if it is first row or the text reads 'readOnly'
		    	cellProperties.renderer = function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
				    Handsontable.renderers.TextRenderer.apply(this, arguments);
				    td.style.background = '#DADFE1';
				};
		    }
		    // Color names dark grey
		    if (col === 0) {
		        cellProperties.readOnly = true; // make cell read-only if it is first row or the text reads 'readOnly'
		    	cellProperties.renderer = function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
				    Handsontable.renderers.TextRenderer.apply(this, arguments);
				    td.style.color = 'white';
				    td.style.background = '#7f8c8d';
				};
		    }
		    // Color preferred dates red
		    if ($.inArray(col - 1, excelData[row]["preferredDates"][nextYear][nextMonth]) >= 0) {
		    	cellProperties.readOnly = true;
		    	cellProperties.renderer = function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
				    Handsontable.renderers.TextRenderer.apply(this, arguments);
				    td.style.background = '#87D37C';
				};
		    }
		    // Color block-out dates green
		    if ($.inArray(col - 1, excelData[row]["blockOutDates"][nextYear][nextMonth]) >= 0) {
		    	cellProperties.readOnly = true;
		    	cellProperties.renderer = function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
				    Handsontable.renderers.TextRenderer.apply(this, arguments);
				    td.style.background = '#EC644B';
				};
		    }
		    return cellProperties;
	    }
	});
	hot = excelTable;
}


// ------------------ HELPER FUNCTIONS --------------------
// Returns the number of days in that particular month
function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

// Returns an array of all the Saturdays and Sundays in the particular month
function getWeekends(year, month, daysInMonth) {
	var weekends = [];
	for (var i = 1; i <= daysInMonth; i++){    // Looping through days in month
	    var newDate = new Date(year, month , i);
	    if(newDate.getDay() == 0 || newDate.getDay() == 6){   // if Sunday or Saturday
	        weekends.push(i);
	    }
	}
	return weekends;
}

// Generates headers for the table
// Header in the form [{data: "name"}, {data: "1"}, {data: "2"}...]
// Refer to HandsOnTable Object data source with column mapping (nested)
function generateColHeaders(daysInMonth) {
	var headers = ["Name"];
	for (i = 1; i <= daysInMonth; i++) {
		headers.push(i);
	}
	return headers;
}

function generateColSchema(daysInMonth) {
	var schema = [{data: "name"}];
	for (i = 1; i <= daysInMonth; i++) {
		schema.push({data: i});
	}
	return schema;
}

/* Structure of the data
[
{name: "Zames", "1": "", "2": "", .... blockOutDates: [], preferredDates: []}
{name: "Chen Kuang", "1": "", "2": "", .... blockOutDates: [], preferredDates: []}
]
*/
function generateData(daysInMonth) {
	var result = [];

	// Init empty row for each user
	var allUsers = Meteor.users.find();
	allUsers.forEach(function(user) {
		var tableRow = {
			name: user.name,
		};
		for (var i = 1; i <= daysInMonth; i++){    // Looping through days in month
			tableRow[i] = "";
		}
		tableRow.blockOutDates = user.blockOutDates;
		tableRow.preferredDates = user.preferredDates;
		result.push(tableRow);
	});
	console.log(JSON.stringify(result));
	return result;
};



// TO DO: Ask about how they want to structure groups
// Load and save feature
// variable rules!