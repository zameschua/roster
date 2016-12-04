import { Template } from 'meteor/templating';
 
import './planRoster.html';

Template.planRoster.helpers({
	admin() {
		return Roles.userIsInRole(Meteor.userId(), 'admin');
	}
});