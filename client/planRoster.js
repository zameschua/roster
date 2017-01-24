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
		Meteor.call('insertData', data, nextYear, nextMonth);
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


var roles = [['role1',1],['role2',2]]; // Role names and weights per day
var publicHolidayDates = [];
Template.excelTable.events({
	// ------------------------------------ Excuting the allocation of dates ---------------------------------------------------
	'click #execute-btn': function(){
		clearExcelData();
		var average = 0; //test variable
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
		

		// Allocate calls to those with preferred call dates
		var datesWithPreference = getPreferredDates(staffCollection);
		var monthAllocation = createMonthAllocation(daysInNextMonth,roles);
		var averageWeight = getAverageWeight(daysInNextMonth,monthWeightage,roles,staffCollection.length);

		
		Object.keys(datesWithPreference).forEach(function (day){
			var day = parseInt(day);
			staffCollection.forEach(function(staff) {
				staff.reset();
			});
			var lowestPointStaff = [];
			var finalList = [];
			datesWithPreference[day].forEach(function (staff){
				// get collection of staff with lowest points
				if (staff.currentPoints == getStaffWithLeastPoints(datesWithPreference[day]).currentPoints){
					lowestPointStaff.push(staff);
				}
			});
			lowestPointStaff.forEach(function (staff){
				if ((staff.lastCallDate+3) < day && !staff.teamOnCall){
					// if "Staff has not done a call for the past 3 days" and "No other team members are on call that day"
					finalList.push(staff);
				}
			});

			
			for (var i=0; i<roles.length; i++){
				if (finalList.length == 0){break;}
				// get weight of role on current day
				var roleWeight = roles[i][1] * monthWeightage[day-1];
				var chosen = false;
				while (!chosen){
					var chosenStaff = getRandomStaff(finalList);
					if (finalList.length == 1 && chosenStaff.currentPoints + roleWeight > averageWeight + 1){
						chosen=true;
					}
					else{
						if (chosenStaff.currentPoints + roleWeight <= averageWeight + 1){
							chosen = true;
							// if Staff's points + callWeight <= averageWeight + 1
							// allocate staff to random role
							chosenStaff.lastCallDate = day;
							// update teamOnCall status of all team members
							staffCollection.forEach(function (staff){
								if (staff.team == chosenStaff.team){
									staff.teamOnCall = true;
								}
							});
							chosenStaff.allocatedDates.push(day);

							// update records in monthAllocation
							monthAllocation[day][roles[i][0]] = chosenStaff;
							// update current weights of staff
							chosenStaff.currentPoints += roleWeight;
							finalList.splice(finalList.indexOf(chosenStaff),1);
						}						
					}
				}
			}				
			
		});
		// reset lastCallDate
		staffCollection.forEach(function(staff) {
			staff.lastCallDate = -3;
		});
		
		// For each day
		for (var day=1;day<=daysInNextMonth;day++){
			// reset staff status
			staffCollection.forEach(function(staff) {
				staff.reset();
			});
			// For each role of each day
			for (var i=0;i<roles.length;i++){
				// if current role in current day is not empty
				if (monthAllocation[day][roles[i][0]] != ""){
					// update teamOnCall status of all other team members
					var chosenStaff = monthAllocation[day][roles[i][0]]; 
					chosenStaff.lastCallDate = day;
					staffCollection.forEach(function (staff){
						if (staff.team == chosenStaff.team){
							staff.teamOnCall = true;
						}
					});
				}

				else{
					// get weight of role on current day
					var roleWeight = roles[i][1] * monthWeightage[day-1];


					// filter out staff who are unable to do calls: leave,post-out,did call for the past 3 days
					var availableStaff = [];
					staffCollection.forEach(function (staff){
						if (staff.isAvailable(day)){
							availableStaff.push(staff);
						}
					});

					// Get staffWithLowestPoints from availableStaff
					var staffWithLowestPoints = []
					var modelStaff = getStaffWithLeastPoints(availableStaff);
					availableStaff.forEach(function (staff){
						if (staff.currentPoints == modelStaff.currentPoints){
							staffWithLowestPoints.push(staff);
						}
					});

					// Get staffFromDiffTeam from staffWithLowestPoints
					var staffFromDiffTeam = [];
					staffWithLowestPoints.forEach(function (staff){
						if (staff.teamOnCall == false){
							staffFromDiffTeam.push(staff);
						}
					});
					
					// Get filteredStaffList by filtering those that blocked out the day
					var filteredStaffList = [];
					staffFromDiffTeam.forEach(function (staff){
						if (staff.blockOutDates.indexOf(day) == -1){
							filteredStaffList.push(staff);
						}
					});

					if (filteredStaffList.length == 0){
						if (staffFromDiffTeam.length == 0){
							// randomly choose staff from staffWithLowestPoints
							var chosenStaff = getRandomStaff(staffWithLowestPoints);
						}
						else{
							// randomly choose staff from staffFromDiffTeam
							var chosenStaff = getRandomStaff(staffFromDiffTeam);
						}
					}
					else{
						// randomly choose staff from filteredStaffList
						var chosenStaff = getRandomStaff(filteredStaffList);
					}
					chosenStaff.allocatedDates.push(day);
					// update records in monthAllocation
					monthAllocation[day][roles[i][0]] = chosenStaff;
					// update current weights of chosen staff
					chosenStaff.currentPoints += roleWeight;
					// update last called date of chosen staff
					chosenStaff.lastCallDate = parseInt(day);
					// update teamOnCall status of all team members
					staffCollection.forEach(function (staff){
						if (staff.team == chosenStaff.team){
							staff.teamOnCall = true;
						}
					});
				}
			}
		}
		updateExcelData();
		console.log(averageWeight);
		staffCollection.forEach(function(staff){
			console.log(staff.name,staff.currentPoints);
			console.log(staff.allocatedDates.length);
		});
	},
});


// ------------------ HELPER FUNCTIONS --------------------
// Returns the number of days in that particular month
function daysInMonth(year, month) {
    return new Date(year, month+1, 0).getDate();
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
	for (var row = 0; row < staffCollection.length; row++) { // Re populate with new data
		staffCollection[row].allocatedDates.forEach(function(col) {
			globalExcelData[row][col] = "x";
		});
	}
}

// Clear the data in globalExcelData
function clearExcelData() {
	for (var row = 0; row < staffCollection.length; row++) { 
		staffCollection = generateStaffCollection(Meteor.users.find({}).fetch()); //reset staffCollection to its original points and allocatedDates
		for (var col = 1; col <= daysInNextMonth; col++) {
			globalExcelData[row][col] = ""; // Reset table
		}
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
  this.lastCallDate = -3; //integer to indicate date of last duty
  this.teamOnCall = false;
  
} 

// Checks if staff is available to work on that day
Staff.prototype.isAvailable = function(day) {
	var nextDate = new Date(nextYear,nextMonth,day+1);

	for (buffer=1;buffer<=3;buffer++){
		if (this.preferredDates.indexOf(day+buffer) != -1)
			return false;
	}

	// if staff has leave on the day, block out the day itself and also the day before
	if (this.leaveDates.indexOf(day) != -1 || this.leaveDates.indexOf(day+1) != -1){
		return false;
	}
	// if staff's postOutDate is next day
	else if (nextDate >= this.postOutDate){
		return false;
	}
	// if staff has done a call for the past 3 days
	else if ((this.lastCallDate+3) > day){
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
  // Someone on the team was on call the previous day
  if (this.teamOnCall == true) {
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
		try{
			prefer.forEach(function (date){
				if (obj[date] == undefined){	//if no one prefers to do this date
					obj[date] = [];
				}
				obj[date].push(staff);
			});			
		}catch (e) {}
	});
	return obj;
}

// Returns whether at least one of the items in one staffCollection is in another staffCollection
function isInside(toBeChecked, checkedAgainst){
	if (toBeChecked.length == 0){
		return false;
	}
	else{
		for (var i=0;i<toBeChecked.length;i++){
			ele = toBeChecked[i];
			if (checkedAgainst.indexOf(ele) != -1){
				return true;
			}
		}
		return false;
	}
	
}

// Returns a master copy of the monthAllocation -> {day: {role1: 'alex', role2: 'zames'...}...}
// method takes in 2 parameters:
	// 1. maxDays - Total number of days in the month
	// 2. roles - an array of the roles -> [[nameOfRole,callWeight]...]
function createMonthAllocation(maxDays, roles){
	var out = {};
	for (var date=1;date<=maxDays;date++){
		var unOccupiedRoles = {};
		for(var i=0;i<roles.length;i++){
			roleName = roles[i][0];
			unOccupiedRoles[roleName] = "";
		}
		out[date] = unOccupiedRoles;
	}
	return out;
}

// Returns the average weight of that particular month
// method takes in 2 parameters:
	// 1. maxDays - Total number of days in the month
	// 2. monthWeightage - Weightage of each day in the month
	// 3. roles - an array of roles to get the weightage of each role

function getAverageWeight(maxDays,monthWeightage,roles,totalNumberOfStaff){
	var totalSum = 0;
	for (var date=0;date<maxDays;date++){
		roles.forEach(function (role){
			totalSum += role[1] * monthWeightage[date]; // multiply weight of day by weight of role
		});
	}
	return Math.ceil(totalSum/totalNumberOfStaff);
}