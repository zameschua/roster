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

	$("#excel-table").handsontable({
	    data: excelData,
	    minSpareRows: 1,
	    colHeaders: true,
	    contextMenu: true,
	    fixedColumnsLeft: 1, // Fixed names column
	    fixedRowsTop: 1, // Fixed dates row
	    manualColumnResize: true,
	    manualRowResize: true,
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
		    // Color headers dark grey
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

function generateData(daysInNextMonth) {
	var result = []

	// Setting up header of the table
	var header = [""];
	for (i = 1; i <= daysInNextMonth; i++) {
		header.push(i);
	}
	result.push(header);

	// Get name for each user
	var allUsers = Meteor.users.find();
	allUsers.forEach(function(user) {
		result.push([user.name]);
	});

	return result;
};