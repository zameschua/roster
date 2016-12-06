import { Template } from 'meteor/templating';
 
import './submit.html';

var preferredDates =  [];

Template.submit.helpers({
	admin: function() {
		return Roles.userIsInRole(Meteor.userId(), 'admin');
	},
	// Callback that runs on click of a day
	// date var is a Moment object from Moment.js
	dayClick: function() {
		return function(date, jsEvent, view) {
	        if (stateIsOn(this)) {
	        	toggleOff(this, date);
	        } else {
	        	toggleOn(this, date);
	        }

	        console.log(preferredDates)
	    }
	}
});

Template.submit.events({
	// Updates user's profile on click of submit button
	'click #submit-btn': function() {
		Meteor.call('updateUser', Meteor.userId(), {"preferredDates": preferredDates});
		alert("Profile successfully updated!");
	}
});

// ----------------- Helper functions ------------------
// Changes the state of the date on the calander to 'blocked'
function toggleOn(self, date) {
	$(self).css('background-color', '#e74c3c');
	$(self).attr("id", "blocked");
	// Add date to preferredDates
	preferredDates.push(parseInt(date.format('DD')));
}
// Changes the state of the date on the calander to 'off'
function toggleOff(self, date) {
	$(self).css('background-color', 'white');
	$(self).attr("id", "");
	// Remove date from preferredDates
	var i = preferredDates.indexOf(parseInt(date.format('DD')));
	if(i != -1) {
		preferredDates.splice(i, 1);
	}
}

// Returns True if state of the date is "blocked"
function stateIsOn(self) {
	return $(self).attr('id') == "blocked";
}