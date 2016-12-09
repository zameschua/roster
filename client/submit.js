import { Template } from 'meteor/templating';
 
import './submit.html';

Meteor.subscribe('allUsers');
var preferredDays =  [];
var blockOutDays = [];
var leaveDays = [];
var list = undefined;
var targetDate = moment().add(1,'M'); // want to show next month's calendar
var state = 0; // 0 -> block 1 -> prefer 2 -> leave

Template.submit.onRendered(function(){
	
	var userId = Meteor.userId();
	list = Meteor.users.find({_id:userId},{'preferredDates':1,'blockOutDates':1,'leaveDates':1});
	list = list.fetch()[0];
	
});

Template.submit.helpers({
	username: function() {
		return Meteor.user().name;
	},
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
			var endDate = (end.month() <= start.month()) ? end.date() : end.date() + start.daysInMonth();
			var color = "";
			switch (state){
				case 0:
					color = '#e74c3c';
					break;
				case 1:
					color = "green";
					break;
				case 2:
					color = "#5bc0de";
					break;
			}			
			for (var i=0;i<endDate-startDate;i++){
				if (stateIsOn(temp,state)) {
					switch (state){
						case 0:
							toggleOff(blockOutDays,temp);
							break;
						case 1:
							toggleOff(preferredDays,temp)
							break;
						case 2:
							toggleOff(leaveDays,temp)
							break;
					}			
		        } else {

		        	toggleOn(temp,color,state);
		        }				
		       	temp = temp.add(1,'d');
			}

		}
	},	
	viewRender: function(){
		return function(view,element){
			preferredDays = helper(list.preferredDates,targetDate.year(),targetDate.month());
			blockOutDays = helper(list.blockOutDates,targetDate.year(),targetDate.month());
			leaveDays = helper(list.leaveDates,targetDate.year(),targetDate.month());
			state = 0;
			
			for (var i=0;i<preferredDays.length;i++){
				day = toDateDay(preferredDays[i].toString());
				$("td[data-date=" + targetDate.format("YYYY-MM")+'-'+day + "][class*= fc-widget-content]").css('background-color', 'green');
			}
			for (var i=0;i<blockOutDays.length;i++){
				day = toDateDay(blockOutDays[i].toString());
				$("td[data-date=" + targetDate.format("YYYY-MM")+'-'+day + "][class*= fc-widget-content]").css('background-color', '#e74c3c');
			}
			for (var i=0;i<leaveDays.length;i++){
				day = toDateDay(leaveDays[i].toString());
				$("td[data-date=" + targetDate.format("YYYY-MM")+'-'+day + "][class*= fc-widget-content]").css('background-color', '#5bc0de');
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
	selectConstraint : function(){
		temp = moment().add(2,'M');
		return {
			start: targetDate.format("YYYY-MM") + "-01",
			end: temp.format("YYYY-MM") + "-01",
		};
	},
});

Template.submit.events({
	'click #sign-out': function() {
	Meteor.logout(function(e) {
	  if (e) {
	    alert(e); // Alert if there is error
	  }
	});
	},
	// Updates user's profile on click of submit button
	'click #submit-btn': function() {
		preferredDays.sort(function(a, b){return a-b});
		list.preferredDates[targetDate.year()][targetDate.month()] = preferredDays;
		Meteor.call('updateUser', Meteor.userId(), {"preferredDates": list.preferredDates});

		blockOutDays.sort(function(a,b){return a-b});
		list.blockOutDates[targetDate.year()][targetDate.month()] = blockOutDays;
		Meteor.call('updateUser', Meteor.userId(), {"blockOutDates": list.blockOutDates});		

		leaveDays.sort(function(a,b){return a-b});
		list.leaveDates[targetDate.year()][targetDate.month()] = leaveDays;
		Meteor.call('updateUser', Meteor.userId(), {"leaveDates": list.leaveDates});			

		console.log("block out: " + blockOutDays);
		console.log("preferred: " + preferredDays);
		console.log("leave: " + leaveDays);
		alert("Profile successfully updated!");

	
	},

	'click #changeState-btn': function(){
		state = (state+1)%3;
		if (state == 0){
			$("#changeState-btn").text('Block Dates');
			$("#changeState-btn").removeClass('btn-info');
			$("#changeState-btn").addClass('btn-danger');
		}		
		else if (state == 1){
			$("#changeState-btn").text('Preferred Dates');
			$("#changeState-btn").removeClass('btn-danger');
			$("#changeState-btn").addClass('btn-success');
		}
		else{
			$("#changeState-btn").text('Leave Dates');
			$("#changeState-btn").removeClass('btn-success');
			$("#changeState-btn").addClass('btn-info');			
		}
		
	}
});

// ----------------- Helper functions ------------------
// Changes the state of the date on the calander to 'blocked'
function toggleOn(date,color,state) {

	//performs two Jquery filtering:
	//1. look for <td> and match record where data-date = date
	//2. only focus on the record whose class has fc-widget-content
	$("td[data-date=" + date.format()+ "][class*= fc-widget-content]").css('background-color', color);
	// Add date to list
	var day = parseInt(date.format('DD'));
	switch (state){
		case 0:
			if (blockOutDays.indexOf(day) == -1){
				blockOutDays.push(day);
			};		

			break;
		case 1:
			if (preferredDays.indexOf(day) == -1){
				preferredDays.push(day);
			};			
			break;			
		case 2:
			if (leaveDays.indexOf(day) == -1){
				leaveDays.push(day);
			};
			break;				
	}
}
// Changes the state of the date on the calander to 'off'
function toggleOff(array,date) {

	//performs two Jquery filtering:
	//1. look for <td> and match record where data-date = date-day
	//2. only focus on the record whose class has fc-widget-content
	$("td[data-date=" + date.format()+ "][class*= fc-widget-content]").css('background-color', 'white');
	// Remove date from list
	var i = array.indexOf(parseInt(date.format('DD')));
	if (i != -1){
		array.splice(i, 1);
	}
}

// Returns True if state of the date is occupied by "blocked" or "preferred"
function stateIsOn(date,state) {
	bgColor = $("td[data-date=" + date.format()+ "][class*= fc-widget-content]").css('background-color');
	if (bgColor == "rgb(231, 76, 60)" && state == 0){
		//if background is red and state is blockOut
		return true;
	}
	else if (bgColor == "rgb(0, 128, 0)" && state == 1){
		//if background is green and state is preferred
		return true;
	}
	else if (bgColor == "rgb(91, 192, 222)" && state == 2){
		//if background is cyan and state is leave
		return true;
	}
	else{
		if (bgColor == "rgb(231, 76, 60)"){
			//if background is red but state is not block out	
			//remove date from blockOutDays
			toggleOff(blockOutDays,date);	
		}
		else if (bgColor == "rgb(0, 128, 0)"){
			//if background is green but state is not preferred
			//remove date from preferredDays
			toggleOff(preferredDays,date);
		}
		else if (bgColor == "rgb(91, 192, 222)"){
			//if background is cyan but state is leave
			//remove date from leaveDays
			toggleOff(leaveDays,date);
		}
		return false;
	}
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