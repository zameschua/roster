import { Template } from 'meteor/templating';
 
import './manageUsers.html';

var temp = {name: undefined, team: undefined, postOutDate: undefined};

Template.manageUsers.helpers({
	admin: function() {
		return Roles.userIsInRole(Meteor.userId(), 'admin');
	},
    users: function() {
        return Meteor.users;
    },
    settings: function(){
      return {
        fields: [
            {key: 'name',label: "Name"},
            {key: 'team', label: "Team"},
            {key: 'postOutDate', label: "Post out date"},
            {key: 'preferredDates', label: 'Preferred dates'},
            {key: 'blockOutDates', label: 'Block out dates'},
            {key: 'allocatedDates', label: 'Allocated Dates'},
            {key: 'carriedOverPoints', label: 'Carried over points'},
            {key: 'roles', label: 'Role'},
            {key: 'edit', label: 'Edit', fn: function () {return new Spacebars.SafeString('<button type="button" class="btn btn-block btn-warning btn-xs" id="edit-btn"><i type="button" class="fa fa-edit" id="edit-btn"></i></button>')}},
            {key: 'delete', label: 'Delete', fn: function () {return new Spacebars.SafeString('<button type="button" class="btn btn-block btn-danger btn-xs" id="delete-btn"><i type="button" class="fa fa-trash" id="delete-btn"></i></button>')}},
        ]
      };
    }
});

Template.manageUsers.events({
  'click .reactive-table tbody tr': function (event) {
    var post = this;

    if (event.target.id == "delete-btn") {
      var input = confirm("Warning! Are you sure you want to delete this user?");
      if (input) {
        // Call function in /server/main.js to remove record in MongoDB
        Meteor.call('deleteUser', post._id);
      }
    } else if (event.target.id == "edit-btn") {
      temp = post;
      // Show the modal (popup)
      $('#editModal').modal('show');
    }
  },
  'click #modal-save': function(event){
    event.preventDefault();

    // Double confirm if setting user as admin
    if ($('#staffRole').val() == "admin") {
    	var result = confirm("Are you sure you want to set this user as admin?");
    	if (!result) {
    		return;
    	}
    }

    var obj = {
      name: $('#staffName').val(),
      team: $('#staffTeam').val(),
      postOutDate: $('#staffDate').val(),
      roles: $('#staffRole').val(),
    };

    // Call function in /server/main.js to update record in MongoDB
    Meteor.call('updateUser', temp._id, obj);

    // Hide the modal
    $('#editModal').modal('hide');
    // Reset the values in the modal input textfields
    $("#editModal").on("hidden.bs.modal", function(){
      $(this).find("input, textarea, select").val('').end();
    });
    // Send user a notification
    alert("Record has been updated.");
  }
});

