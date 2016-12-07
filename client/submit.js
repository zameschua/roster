import { Template } from 'meteor/templating';
 
import './submit.html';

Meteor.subscribe('allUsers');
var preferredDays =  [];
var list = undefined;
var targetDate = moment().add(1,'M'); // want to show next month's calendar

Template.submit.onRendered(function(){
	
	var userId = Meteor.userId();
	list = Meteor.users.find({_id:userId},{'preferredDates':1,'blockOutDates':1});
	list = list.fetch()[0];
	
});

Template.submit.helpers({
	admin: function() {
		return Roles.userIsInRole(Meteor.userId(), 'admin');
	},
	// Callback that runs on click of a day
	// date var is a Moment object from Moment.js
	/**dayClick: function() {
		return function(date, jsEvent, view) {
			
	        if (stateIsOn(date)) {
	        	toggleOff(date);
	        } else {
	        	toggleOn(date);
	        }
	        console.log("onclick: " + preferredDates)
	    }
	},**/
	select: function(){
		return function( start, end, jsEvent, view){
			var temp = start;
			var startDate = start.date();
			var endDate = end.date();
			for (var i=0;i<endDate-startDate;i++){
				if (stateIsOn(temp)) {
		        	toggleOff(temp);
		        } else {
		        	toggleOn(temp);
		        }				
		       	temp = temp.add(1,'d');
			}

		}
	},	
	viewRender: function(){
		return function(view,element){
			preferredDays = helper(list.preferredDates,targetDate.year(),targetDate.month());
			
			for (var i=0;i<preferredDays.length;i++){
				day = toDateDay(preferredDays[i].toString());
				$("td[data-date=" + targetDate.format("YYYY-MM")+'-'+day + "][class*= fc-widget-content]").css('background-color', '#e74c3c');
			}
			
		}
	},
	header: function(){
		return {
				left: 'title',
				center: '',
				right: '', 
			}
	},
	defaultDate: function(){
		return targetDate;
	},
	
});

Template.submit.events({
	// Updates user's profile on click of submit button
	'click #submit-btn': function() {
		preferredDays.sort(function(a, b){return a-b});
		console.log(preferredDays);
		list.preferredDates[targetDate.year()][targetDate.month()] = preferredDays;
		Meteor.call('updateUser', Meteor.userId(), {"preferredDates": list.preferredDates});
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
	// Add date to preferredDays
	var day = parseInt(date.format('DD'));
	if (preferredDays.indexOf(day) == -1){
		preferredDays.push(day);
	}
}
// Changes the state of the date on the calander to 'off'
function toggleOff(date) {

	//performs two Jquery filtering:
	//1. look for <td> and match record where data-date = date-day
	//2. only focus on the record whose class has fc-widget-content
	$("td[data-date=" + date.format()+ "][class*= fc-widget-content]").css('background-color', 'white');
	// Remove date from preferredDays
	var i = preferredDays.indexOf(parseInt(date.format('DD')));
	if(i != -1) {
		preferredDays.splice(i, 1);
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

// json helper for preferredDates and blockoutDates
function helper(obj,outerField,innerField){
	if (obj[outerField]){
		//if both year exists in json
		if (obj[outerField][innerField]){
			//if month exists in json
		}	
		else{
			obj[outerField][innerField] = [];
		}
	}
	else{
		//if both year and month do not exist
		obj[outerField]= {};
		obj[outerField][innerField] = [];
	}	

	return  obj[outerField][innerField];
}