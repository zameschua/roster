import { Template } from 'meteor/templating';
 
import './submit.html';

Meteor.subscribe('allUsers');
var preferredDates =  [];
var list = undefined;

Template.submit.onRendered(function(){
	
	var userId = Meteor.userId();
	list = Meteor.users.find({_id:userId},{'preferredDates':1});
	
});

Template.submit.helpers({
	admin: function() {
		return Roles.userIsInRole(Meteor.userId(), 'admin');
	},
	// Callback that runs on click of a day
	// date var is a Moment object from Moment.js
	dayClick: function() {
		return function(date, jsEvent, view) {
			
	        if (stateIsOn(date)) {
	        	toggleOff(date);
	        } else {
	        	toggleOn(date);
	        }
	        console.log("onclick: " + preferredDates)
	    }
	},
	viewRender: function(){
		return function(view,element){
			preferredDates = list.fetch()[0].preferredDates;
			for (var i=0;i<preferredDates.length;i++){
				day = toDateDay(preferredDates[i].toString());
				$("td[data-date=" + '2016-12-' + day + "][class*= fc-widget-content]").css('background-color', '#e74c3c');
			}
			
		}
	},
});

Template.submit.events({
	// Updates user's profile on click of submit button
	'click #submit-btn': function() {
		preferredDates.sort(function(a, b){return a-b});
		Meteor.call('updateUser', Meteor.userId(), {"preferredDates": preferredDates});
		alert("Profile successfully updated!");

	
	}
});

// ----------------- Helper functions ------------------
// Changes the state of the date on the calander to 'blocked'
function toggleOn(date) {
	
	//performs two Jquery filtering:
	//1. look for <td> and match record where data-date = date
	//2. only focus on the record whose class has fc-widget-content
	$("td[data-date=" + date.format()+ "][class*= fc-widget-content]").css('background-color', '#e74c3c');
	// Add date to preferredDates
	var day = parseInt(date.format('DD'));
	if (preferredDates.indexOf(day) == -1){
		preferredDates.push(day);
	}
}
// Changes the state of the date on the calander to 'off'
function toggleOff(date) {

	//performs two Jquery filtering:
	//1. look for <td> and match record where data-date = date-day
	//2. only focus on the record whose class has fc-widget-content
	$("td[data-date=" + date.format()+ "][class*= fc-widget-content]").css('background-color', 'white');
	// Remove date from preferredDates
	var i = preferredDates.indexOf(parseInt(date.format('DD')));
	if(i != -1) {
		preferredDates.splice(i, 1);
	}
}

// Returns True if state of the date is "blocked"
function stateIsOn(date) {
	return $("td[data-date=" + date.format()+ "][class*= fc-widget-content]").css('background-color') == "rgb(231, 76, 60)" ? true : false;
}

// String to date-day formatting
function toDateDay(string){
	//one line condition syntax -> (condition) ? (when true) : (when false)
	return string.length == 2 ? string : '0'+string;
}