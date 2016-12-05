import { Template } from 'meteor/templating';
 
import './dashboard.html';


Template.dashboard.helpers({
	admin: function() {
		return Roles.userIsInRole(Meteor.userId(), 'admin');
	}
});

Template.dashboard.rendered = function() {
	var id = Meteor.userId();
	console.log(id);
	var user = Meteor.users.findOne({meteorId: id});
	console.log(user);
	Modal.show('updateProfile'); // Todo: Show modal only when user first log in
};