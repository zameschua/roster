import { Template } from 'meteor/templating';
 
import './dashboard.html';

Template.dashboard.helpers({
	admin: function() {
		return Roles.userIsInRole(Meteor.userId(), 'admin');
	}
});