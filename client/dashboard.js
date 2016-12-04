import { Template } from 'meteor/templating';
 
import './dashboard.html';

Template.dashboard.helpers({
	admin() {
		return Roles.userIsInRole(Meteor.userId(), 'admin');
	}
});