import { Template } from 'meteor/templating';
 
import './manageUsers.html';
import { staffCollection } from '/imports/api/staffCollection.js';



Template.manageUsers.helpers({
	admin: function() {
		return Roles.userIsInRole(Meteor.userId(), 'admin');
	},
    staffCollection: function () {
        return staffCollection;
    },
    settings: function(){
      return {
        fields: [
          {key:'name',label: "Name"},
          {key: 'team', label: "Team"},
          {key: 'postOutDate', label: "Post out date",fn: function(value){return value.toDateString();}},
          {key: 'preferredDates', label: 'Preferred dates'},
          {key: 'blockOutDates', label: 'Block out dates'},
          {key: 'allocatedDates', label: 'Allocated Dates'},
          {key: 'carriedOverPoints', label: 'Carried over points'},
          {key: 'edit', label: 'Edit', fn: function () {return new Spacebars.SafeString('<button type="button" class="btn btn-block btn-warning btn-xs edit-btn"><i type="button" class="fa fa-edit"></i></button>')}},
          {key: 'delete', label: 'Delete', fn: function () {return new Spacebars.SafeString('<button type="button" class="btn btn-block btn-danger btn-xs delete-btn"><i type="button" class="fa fa-trash"></i></button>')}},
        ]
      };
    }
});

Template.manageUsers.events({
	'click .reactive-table tbody tr': function (event) {
    var post = this;

    if (event.target.className == "delete-btn") {
    	Meteor.call('deleteUser', post._id);
    } else if (event.target.className == "edit-btn") {
		;
    }
  }
});

