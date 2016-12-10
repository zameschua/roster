import { Template } from 'meteor/templating';
 
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
	}
});

Template.dashboard.rendered = function() {
	setTimeout(function(){ 
		if (Meteor.user().name == "undefined") {
			Modal.show('firstLogin');
		}
	}, 1000);
};

Template.firstLogin.rendered = function(){
    $('#staffDateDiv').datepicker({format: "yyyy/mm/dd",});
    $('#staffDateDiv').on("changeDate",function(){$("#staffDate").val($("#staffDateDiv").datepicker("getFormattedDate"))});
};

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

    // Hide the modal
    $('#editModal').modal('hide');
    // Reset the values in the modal input textfields
    $("#editModal").on("hidden.bs.modal", function(){
      $(this).find("input, textarea, select").val('').end();
    });
    // Send user a notification
    alert("Your profile has been updated!");
  }
});