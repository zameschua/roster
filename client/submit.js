import { Template } from 'meteor/templating';
 
import './submit.html';

Template.submit.helpers({
	admin() {
		return Roles.userIsInRole(Meteor.userId(), 'admin');
	}
});