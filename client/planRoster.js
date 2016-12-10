/*
Warning!
This page is NOT mobile friendly!
*/

import { Template } from 'meteor/templating';
 
import './planRoster.html';
import { RosterDataCollection } from '/imports/api/RosterDataCollection';

// Init global vars
var globalExcelData = [];
var staffCollection = []; 
var excelTable = false;

var today = new Date();
var nextYear = today.getFullYear(); // Year of the next month
var nextMonth = (today.getMonth() + 1) % 12; // NOTE: Jan is 0, Dec is 11. Follows Javascript's Date object implementation
if (nextMonth == 0) { // If month is in December, nextYear will be the next year
	nextYear += 1; 
}
var daysInNextMonth = daysInMonth(nextYear, nextMonth);
var weekends = getWeekends(nextYear, nextMonth, daysInNextMonth);



var numOfRoles = 1; // Number of roles needed per day. To be changed
var publicHolidayDates = [];


Template.planRoster.helpers({
	username: function() {
		return Meteor.user().name;
	},
	// Show additional menu items if user is admin
	admin: function() {
		return Roles.userIsInRole(Meteor.userId(), 'admin');
	}
});

Template.planRoster.events({
	'click #sign-out': function() {
	Meteor.logout(function(e) {
	  if (e) {
	    alert(e); // Alert if there is error
	  }
	});
	},
	'click #load-btn': function() {
		try{
			var data = RosterDataCollection.findOne()[nextYear][nextMonth];
			excelTable.loadData(data);
			alert("Load successful!")
		} catch(err) {
			alert("Load failed! " + e);
		}
	},
	'click #save-btn': function() {
		var data = {};
		data[nextYear] = {};
		data[nextYear][nextMonth] = excelTable.getData();
		Meteor.call('insertData', data);
		alert("Data saved!");
	},
});


// -------------------------------------- Generating the excel Table ---------------------------------------------------
// Using handsontable for the excel-table
// Docs:  https://docs.handsontable.com/pro/1.8.0/tutorial-introduction.html
Template.excelTable.rendered = function() {
	// Initialise staff collection
	var list = Meteor.users.find({}).fetch();
	staffCollection = generateStaffCollection(list);

	// Generate empty data to be displayed
	globalExcelData = generateEmptyData();
	var colHeaders = generateColHeaders(daysInNextMonth);

	// Initialise HandsOnTable
	var container = document.getElementById('excel-table');
	excelTable = new Handsontable(container, {
	    data: globalExcelData,
	    colHeaders: colHeaders,
	    contextMenu: true,
	    fixedColumnsLeft: 1, // Fixed names column
	    fixedRowsTop: 1, // Fixed dates row
	    manualColumnResize: true,
	    manualRowResize: true,
	    observeChanges: true,
	    colWidths: function(col) {
	    	if (col === 0) {
	    		return 120; // Width of first column
	    	} else {
	    		return 35; // Width of the other columns
	    	}
	    },
	    cells: function(row, col, prop) {
	    	var cellProperties = {};

	    	// Color all the weekends grey
	    	if ($.inArray(col, weekends) >= 0) {
		        cellProperties.readOnly = true; // make cell read-only if it is first row or the text reads 'readOnly'
		    	cellProperties.renderer = function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
				    Handsontable.renderers.TextRenderer.apply(this, arguments);
				    td.style.background = '#DADFE1';
				};
		    }
		    // Color the column with names dark grey
		    if (col === 0) {
		        cellProperties.readOnly = true; // make cell read-only if it is first row or the text reads 'readOnly'
		    	cellProperties.renderer = function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
				    Handsontable.renderers.TextRenderer.apply(this, arguments);
				    td.style.color = 'white';
				    td.style.background = '#7f8c8d';
				};
		    }
		    // Color preferred dates red
		    if ($.inArray(col, staffCollection[row].preferredDates) >= 0) {
		    	cellProperties.readOnly = true;
		    	cellProperties.renderer = function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
				    Handsontable.renderers.TextRenderer.apply(this, arguments);
				    td.style.background = '#87D37C';
				};
		    }
		    // Color block-out dates green
		    if ($.inArray(col, staffCollection[row].blockOutDates) >= 0) {
		    	cellProperties.readOnly = true;
		    	cellProperties.renderer = function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
				    Handsontable.renderers.TextRenderer.apply(this, arguments);
				    td.style.background = '#EC644B';
				};
			}
			// Color leave dates cyan
		    if ($.inArray(col, staffCollection[row].leaveDates) >= 0) {
		    	cellProperties.readOnly = true;
		    	cellProperties.renderer = function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
				    Handsontable.renderers.TextRenderer.apply(this, arguments);
				    td.style.background = '#5bc0de';
				};			
		    }
		    
		    return cellProperties;
	    }
	});
}

Template.excelTable.events({
	// ------------------------------------ Excuting the allocation of dates ---------------------------------------------------
	'click #execute-btn': function(){
		var monthWeightage = getMonthWeightage(nextYear,nextMonth,{
			0 : 2,	// Sunday
			1 : 1,	// Monday
			2 : 1,	// Tuesday
			3 : 1,	// Wednesday
			4 : 1,	// Thursday
			5 : 1.5,	// Friday
			6 : 2,	// Saturday
			ph : 2,	// Public holiday
			});
		


		// Allocate duty dates to those with preferred dates
		
		var datesWithPreference = getPreferredDates(staffCollection);
		var occupiedWithPreferredDates = [];
		Object.keys(datesWithPreference).forEach(function (key){
			occupiedWithPreferredDates.push(parseInt(key));
			preferredStaff = datesWithPreference[key];


		});

		// For each day
		for (var day = 1; day <= daysInNextMonth; day++){
			staffCollection.forEach(function(staff) {
				staff.reset();
			});
			// For each role
			for (var i = 0; i < numOfRoles; i++){
				// Generate an array of staff who has preferred date on the day
				var preferredAvailableStaff = datesWithPreference[day.toString()];
				var priorityStaff = [];		// Array of staff to be chosen
				var availableStaff = [];	// Array of staff who is available (not including staff with block out days)

				staffCollection.forEach(function (staff){
					if (staff.isAvailable(day)){
						availableStaff.push(staff);
					}
				});

				var availableStaffWithLeastPoints = getStaffWithLeastPoints(availableStaff);
				try{
					var preferredStaffWithLeastPoints = getStaffWithLeastPoints(preferredAvailableStaff);
				} catch(err){
					var preferredStaffWithLeastPoints = new Staff(undefined, undefined, undefined, undefined, undefined, undefined, 0);
				}
				
				try {
					if (occupiedWithPreferredDates.indexOf(day) != -1 && preferredStaffWithLeastPoints.currentPoints - availableStaffWithLeastPoints.currentPoints < 2){
						// If this date has people who want to do duty
						// And has points lower than the lowest of (&& preferredStaffWithLeastPoints.currentPoints - availableStaffWithLeastPoints.currentPoints > 1) 
						// Prioritize them first
						preferredAvailableStaff.forEach(function(staff){
							if (staff.currentPoints == preferredStaffWithLeastPoints.currentPoints){
								priorityStaff.push(staff);
							}
						});
					}
					else{
						var blockOutFiltered = [];
						availableStaff.forEach(function(staff){
							if (staff.blockOutDates.indexOf(day) == -1){
								blockOutFiltered.push(staff);
							}
						});
						if (blockOutFiltered.length == 0){
							var availableStaffWithLeastPoints = getStaffWithLeastPoints(availableStaff);
							console.log(availableStaff);
							availableStaff.forEach(function(staff){
								if (staff.currentPoints == availableStaffWithLeastPoints.currentPoints){
									priorityStaff.push(staff);
								}
							});								
						}
						else{
							var availableStaffWithLeastPoints = getStaffWithLeastPoints(blockOutFiltered);
							blockOutFiltered.forEach(function(staff){
								if (staff.currentPoints == availableStaffWithLeastPoints.currentPoints){
									priorityStaff.push(staff);
								}
							});								
						}
				
					}
				} catch(e) {
					alert("There is no suitable staff on " + day + " day");
				}
				try {
				var chosenStaff = getRandomStaff(priorityStaff);
				chosenStaff.pastDays = 1;
				chosenStaff.currentPoints += monthWeightage[day-1]; //to be updated
				chosenStaff.allocatedDates.push(day);
				staffCollection.forEach(function (staff){
					if (staff.team == chosenStaff.team){
						staff.teamOnCall = true;
					}
				});
				} catch (e) {
					alert("There is no suitable staff on " + day + " day");
				}
			};
		}
		staffCollection.forEach(function(staff){
			console.log(staff.name,staff.currentPoints);
			console.log(staff.allocatedDates);
		});

		updateExcelData();
	},
});


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
	for (var i = 1; i <= daysInMonth; i++) {
		headers.push(i);
	}
	return headers;
}

// Generates empty data for excel table on init
function generateEmptyData() {
	var excelData = [];
	staffCollection.forEach(function(staff) {
		var staffData = [staff.name];
		for (var i = 1; i <= daysInNextMonth; i++) {
			staffData.push("");
		}
		excelData.push(staffData);
	});
	return excelData;
}

// Change the data in globalExcelData, to be reflected in HandsOnTable
function updateExcelData() {
	for (var row = 0; row < staffCollection.length; row++) {
		staffCollection[row].allocatedDates.forEach(function(col) {
			globalExcelData[row][col] = "x";
		});
	}
}

// Init Staff class
var Staff = function(name, team, preferredDates, blockOutDates, leaveDates, postOutDate, carriedOverPoints){
  this.name = name;
  this.team = team;
  this.preferredDates = preferredDates;
  this.blockOutDates = blockOutDates;
  this.postOutDate = new Date(postOutDate);	//date object
  this.leaveDates = leaveDates
  this.currentPoints = carriedOverPoints;
  this.allocatedDates = [];
  this.pastDays = 0; //integer to indicate number of days past since first duty
  this.teamOnCall = false;
  this.consecTeamOnCall = false;
  
} 

// Checks if staff is available to work on that day
Staff.prototype.isAvailable = function(day) {
	var nextDate = new Date(nextYear,nextMonth,day+1);
	//if staff choose to block out current day
	if (this.leaveDates.indexOf(day) > -1){
		return false;
	}
	//if staff's blockOutDate is next day
	else if (this.leaveDates.indexOf(day+1) > -1){
		return false;
	}
	//if staff's postOutDate is next day
	else if (nextDate >= this.postOutDate){
		return false;
	}
	//arbitruary conditions
	else if (this.teamOnCall || this.consecTeamOnCall || this.pastDays != 0){
		return false;
	}
	else{
		return true;
	}
} 

// Takes in array of Staff, returns the staff with least points.
// If 2 people have the same points, return the first staff
function getStaffWithLeastPoints(arr) {
	var currentLowestStaff = arr[0];
	arr.forEach(function(staff) {
	if (staff.currentPoints <= currentLowestStaff.currentPoints) {
	  currentLowestStaff = staff;
	}
	});
	return currentLowestStaff;
}

// Takes in an array of staffs, returns a random staff
function getRandomStaff(arr) {
  var randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
};

// Run at the start of each day
// Reset the staff's state for the next day
Staff.prototype.reset = function() {
  // Reduce the number of days since the staff was on call
  if (this.pastDays > 0) {
    this.pastDays -= 1; 
  }
  // Reset consecTeamOnCall
  if (this.consecTeamOnCall === true) {
    this.consecTeamOnCall = false;  
  }
  // Someone on the team was on call the previous day
  if (this.teamOnCall === true) {
    this.consecTeamOnCall = true;
    this.teamOnCall = false;
  }
}

// Function to create staffCollection array from Meteor.users
// Returns an array of Staff
function generateStaffCollection(obj){
	var staffCollection = [];
	for (var i = 0; i < obj.length; i++){
		user = obj[i];
		var json = new Staff(
			user.name,
			user.team,
			user.preferredDates[nextYear][nextMonth],
			user.blockOutDates[nextYear][nextMonth],
			user.leaveDates[nextYear][nextMonth],
			user.postOutDate,
			user.carriedOverPoints,	
		);
		staffCollection.push(json);
	};
	return staffCollection;
}

// Creates an array of weightages of each day in the month
// WeightageSettings = {day (e.g. sunday = 0, monday = 1...) : weightage , 'ph' (public holiday) : weightage}
function getMonthWeightage(year, month, weightageSettings){
	var daysOfMonth = daysInMonth(year,month);
	var weightage = [];
	for (var i = 1; i <= daysOfMonth; i++){    // Looping through days in month
	    var newDate = new Date(year, month , i);
	    if (publicHolidayDates.indexOf(i) != -1){	//if public holiday
	    	weightage.push(weightageSettings['ph']);
	    }
	    else{	//else if normal day of the week
	    	weightage.push(weightageSettings[newDate.getDay()]);
	    }
	}
	return weightage;	
}

// Returns an object with dates that has preference by staff and an array of staff themselves
// e.g. {23 : [Object Staff1, Object Staff2], 24 : [Object Staff4]}
function getPreferredDates(staffCollection){
	var obj = {};
	staffCollection.forEach(function (staff){
		var prefer = staff.preferredDates;
		prefer.forEach(function (date){
			if (obj[date] == undefined){	//if no one prefers to do this date
				obj[date] = [];
			}
			obj[date].push(staff);
		});
	});
	return obj;
}