import { Template } from 'meteor/templating';
import { RosterDataCollection } from '/imports/api/RosterDataCollection';
import './dashboard.html';

Template.dashboard.events({
  'click #sign-out': function() {
    Meteor.logout(function(e) {
      if (e) {
        alert(e); // Alert if there is error
      }
    });
  }
});

Template.dashboard.helpers({
  username: function() {
    try {
      return Meteor.user().name;
    } catch(err) {
      return ;
    }
  },
	// Show additional buttons if user is admin
	admin: function() {
		return Roles.userIsInRole(Meteor.userId(), 'admin');
	},
});

Template.dashboard.rendered = function() {
	setTimeout(function(){ 
		if (Meteor.user().name == "undefined") {
			Modal.show('firstLogin');
		}
	}, 1000);
};




// --------------------- Modal on first login -----------------------------
Template.firstLogin.rendered = function(){
    $('#staffDateDiv').datepicker({format: "yyyy/mm/dd",});
    $('#staffDateDiv').on("changeDate",function(){$("#staffDate").val($("#staffDateDiv").datepicker("getFormattedDate"))});
};

Template.firstLogin.helpers({
  teamList : teamHelper(10),
});

Template.firstLogin.events({
  'click #modal-save': function(event){
    event.preventDefault();

    var obj = {
      name: $('#staffName').val(),
      team: $('#staffTeam').val(),
      postOutDate: $('#staffDate').val(),
    };

    // Call function in /server/main.js to update record in MongoDB
    Meteor.call('updateUser', Meteor.userId(), obj);
    // Reset the values in the modal input textfields

    $("#editModal").on("hidden.bs.modal", function(){
      $(this).find("input, textarea, select").val('').end();
    });
    // Hide the modal
    $('#editModal').modal('hide');
    
    
    // Send user a notification
    alert("Your profile has been updated!");
  }
});

// -----------------------------Methods for calendar ----------------------------------


Template.dashboardCalendar.rendered = function() {
  $('#calendar').fullCalendar();
  var today = new Date();
  var month = today.getMonth();
  var year = today.getFullYear();

  Meteor.subscribe('RosterDataCollection', function(){
    Session.set('dataLoaded', true);
  });
  Tracker.autorun(function () { // Triggered when database is loaded
    var sessionVal = Session.get("dataLoaded")
    var calendarData = RosterDataCollection.findOne();
    for (var year in calendarData) {
      if (year === "_id") {
        ; // Ignore if we're iterating over object _id
      } else {
        for (var month in calendarData[year]) {
          var monthData = calendarData[year][month];

          // For each user
          monthData.forEach(function(user) {
            var name = user[0];
            user.shift();

            // For each day
            // Array of empty strings and "x", ie. ["", "", "x", ""]
            for (var i = 0; i < user.length; i++) {
              if (user[i] === "x") {
                $('#calendar').fullCalendar( 'renderEvent', {
                    title: name,
                    start: year + "-" + (month + 1) + "-" + (i + 1),
                }, true);
              }
            };
          });
        };
      }
    };
  });
}






//Use this method to create number of teams to be shown in the drop down box
function teamHelper(numOfTeams){
  var out = [];
  for (var i = 1; i <= numOfTeams; i++){
    var teamVal = 'option ' + i;
    out.push(teamVal);
  };

  return out;
};