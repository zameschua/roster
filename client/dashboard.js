import { Template } from 'meteor/templating';
 
import './dashboard.html';
import { staffCollection } from '/imports/api/staffCollection.js';


Template.dashboard.helpers({
	admin: function() {
		return Roles.userIsInRole(Meteor.userId(), 'admin');
	}
});

Template.dashboard.rendered = function() {
	var id = Meteor.userId();
	console.log(id);
	var user = staffCollection.findOne({meteorId: id});
	console.log(user);
	Modal.show('updateProfile'); // Todo: Show modal only when user first log in
	// Todo: Update the staffCollection when user updates it
};