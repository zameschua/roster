/*
Warning!
This page is NOT mobile friendly!
*/

import { Template } from 'meteor/templating';
 
import './planRoster.html';

Template.planRoster.helpers({
	// Show additional menu items if user is admin
	admin: function() {
		return Roles.userIsInRole(Meteor.userId(), 'admin');
	}
});

var data = [
	// Checking if the page have enough space for 31 columns
	["Feb", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
	["name1", 10, 11, 12, 13],
	["name2", 20, 11, 14, 13],
	["name3", 30, 15, 12, 13]
];

// Using handsontable for the excel-table
// Docs:  https://docs.handsontable.com/pro/1.8.0/tutorial-introduction.html
Template.excelTable.rendered = function() {
	// Get the next month
	var today = new Date();
	var nextYear = today.getFullYear();
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

	$("#excel-table").handsontable({
	    data: data,
	    minSpareRows: 1,
	    colHeaders: true,
	    contextMenu: true,
	    fixedColumnsLeft: 1, // Fixed names column
	    fixedRowsTop: 1, // Fixed dates row
	    manualColumnResize: true,
	    manualRowResize: true,
	    cells: function(row, col, prop) {
	    	var cellProperties = {};
	    	if ($.inArray(col, weekends) >= 0) {
		        cellProperties.readOnly = true; // make cell read-only if it is first row or the text reads 'readOnly'
		    	cellProperties.renderer = function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
				    Handsontable.renderers.TextRenderer.apply(this, arguments);
				    td.style.background = '#DADFE1';
				};
		    }
		    if (row === 0 || col === 0) {
		        cellProperties.readOnly = true; // make cell read-only if it is first row or the text reads 'readOnly'
		    	cellProperties.renderer = function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
				    Handsontable.renderers.TextRenderer.apply(this, arguments);
				    td.style.color = 'white';
				    td.style.background = '#7f8c8d';
				};
		    }

		    return cellProperties;
	    }
	});
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

