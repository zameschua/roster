import { Template } from 'meteor/templating';
 
import './manageUsers.html';

var temp = {name: undefined, team: undefined, postOutDate: undefined};
var targetDate = moment().add(1,'M');


Template.manageUsers.helpers({
  username: function() {
    return Meteor.user().name;
  },
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
          {key: 'preferredDates.' + targetDate.year() + '.' + targetDate.month(), label: 'Preferred dates'},
          {key: 'blockOutDates.' + targetDate.year() + '.' + targetDate.month(), label: 'Block out dates'},
          {key: 'leaveDates.'+ targetDate.year() + '.' + targetDate.month(), label: 'Leave dates'},
          {key: 'allocatedDates.' + targetDate.year() + '.' + targetDate.month(), label: 'Allocated Dates'},
          {key: 'carriedOverPoints', label: 'Carried over points'},
          {key: 'roles', label: 'Role'},
          {key: 'edit', label: 'Edit', fn: function () {return new Spacebars.SafeString('<button type="button" class="btn btn-block btn-warning btn-xs btn-flat" id="edit-btn"><i type="button" class="fa fa-edit" id="edit-btn"></i></button>')}},
          {key: 'delete', label: 'Delete', fn: function () {return new Spacebars.SafeString('<button type="button" class="btn btn-block btn-danger btn-xs btn-flat" id="delete-btn"><i type="button" class="fa fa-trash" id="delete-btn"></i></button>')}},
      ]
    };
  },
  

});

Template.addStaffButton.helpers({
  dateHelper : function(){
    return moment().add(1,'M').format("MMMM YYYY");
  },
});

Template.editUsersCollection.helpers({
  teamList : teamHelper(10),
});

Template.manageUsers.events({
  'click #sign-out': function() {
    Meteor.logout(function(e) {
      if (e) {
        alert(e); // Alert if there is error
      }
    });
  },
  'click .reactive-table tbody tr': function (event) {
    var post = this;

    if (event.target.id == "delete-btn") {
      var input = confirm("Warning! Are you sure you want to delete this user?");
      if (input) {
        // Call function in /server/main.js to remove record in MongoDB
        Meteor.call('deleteUser', post._id);
      }
    } else if (event.target.id == "edit-btn") {
      $('#staffDateDiv').datepicker({format: "yyyy/mm/dd",});
      $('#staffDateDiv').on("changeDate",function(){$("#staffDate").val($("#staffDateDiv").datepicker("getFormattedDate"))});
      temp = post;

      //INIT modal listeners for hidden and shown
      $('#editModal').on("shown.bs.modal",function(){
        $("#staffName").val(temp.name);
        $('#staffTeam').val(temp.team);
        $('#staffDate').val(temp.postOutDate);
        $('#staffRole').val(temp.roles);
      });
      // Reset the values in the modal input textfields
      $("#editModal").on("hidden.bs.modal", function(){
        $(this).find("input, textarea, select").val('').end();
      });

      // Show the modal (popup)
      $('#editModal').modal('show');
      
    }
  },
  'click #edit-modal-save': function(event){
    event.preventDefault();

    // Double confirm if setting user as admin
    if ($('#staffRole').val() == "admin") {
    	var result = confirm("Are you sure you want to set this user as admin?");
    	if (!result) {
    		return;
    	}
    }
    console.log($('#staffTeam').val());
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

    // Send user a notification
    alert("Record has been updated.");
  },
  'click .addStaffButton': function(event){
    $('#newStaffDateDiv').datepicker({format: "yyyy/mm/dd",});
    $('#newStaffDateDiv').on("changeDate",function(){$("#newStaffDate").val($("#newStaffDateDiv").datepicker("getFormattedDate"))});
    $('#addModal').modal('show');
  },
  'click #add-modal-save': function(event){
    event.preventDefault();
    // Double confirm if setting user as admin
    if ($('#staffRole').val() == "admin") {
      var result = confirm("Are you sure you want to set this user as admin?");
      if (!result) {
        return;
      }
    }
    var obj = {
      name: $('#newStaffName').val(),
      team: $('#newStaffTeam').val(),
      postOutDate: $('#newStaffDate').val(),
      roles: $('#newStaffRole').val(),
      email: $('#newStaffEmail').val(),
    };

    // Call function in /server/main.js to update record in MongoDB
    Meteor.call('insertUser', obj);
   
    // Reset the values in the modal input textfields
    $("#addModal").on("hidden.bs.modal", function(){
      $(this).find("input, textarea, select").val('').end();
    });

    // Hide the modal
    $('#addModal').modal('hide');

    // Send user a notification
    alert("Record has been added.");
  },
});

//Use this method to create number of teams to be shown in the drop down box
function teamHelper(numOfTeams){
  var out = [];
  for (var i = 1; i <= numOfTeams; i++){
    var teamVal = 'option ' + i;
    out.push(teamVal);
  };

  return out;
};