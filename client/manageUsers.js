import { Template } from 'meteor/templating';
 
import './manageUsers.html';

Template.manageUsers.helpers({
	admin() {
		return Roles.userIsInRole(Meteor.userId(), 'admin');
	}
});