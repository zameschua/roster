import { Template } from 'meteor/templating';
 
import './submit.html';

Template.submit.helpers({
	admin: function() {
		return Roles.userIsInRole(Meteor.userId(), 'admin');
	}
});