import { Template } from 'meteor/templating';
 
import './manageUsers.html';
import '/imports/api/staffCollection.js';

Template.manageUsers.helpers({
	admin() {
		return Roles.userIsInRole(Meteor.userId(), 'admin');
	},
    staffCollection: function () {
        return staffCollection;
    }
});