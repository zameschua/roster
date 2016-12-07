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
	var nextMonth = (today.getMonth() + 2) % 12;





	$("#excel-table").handsontable({
	    data: data,
	    minSpareRows: 1,
	    colHeaders: true,
	    contextMenu: true,
	    fixedColumnsLeft: 1, // Fixed names column
	    fixedRowsTop: 1, // Fixed dates row
	    manualColumnResize: true,
	    manualRowResize: true
	});
}

