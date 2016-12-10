import { Meteor } from 'meteor/meteor';
import { RosterDataCollection } from '/imports/api/RosterDataCollection';

var currMoment = new Date();
currMoment.setMonth(currMoment.getMonth() + 1);
var month = currMoment.getMonth();
var year = currMoment.getFullYear();


Meteor.startup(() => {
	// Publish collections to all users for now
	// Switch to admin later
	Meteor.publish("AllUsersCollection", function() {
		return Meteor.users.find();
	});
	Meteor.publish("RosterDataCollection", function() {
		return RosterDataCollection.find();
	});
});


Meteor.methods({
	deleteUser: function(id) {
		Meteor.users.remove(id);
	},
	updateUser: function(id, obj) {
		Meteor.users.update({_id: id}, {$set: obj});
	},
	insertUser: function(obj){
		var newUser = Accounts.createUser({
			// default password for newly created accounts to be p@ssword123
			password: 'p@ssword123',
			email: obj.email,
		});
		// remove email attribute in json obj to avoid duplicate of email address attribute in Meteor.users database
		delete obj.email,
		Meteor.users.update({_id: newUser}, {$set: obj});
	},
	insertData: function(obj) {
		RosterDataCollection.insert(obj);
	}
});

Accounts.onCreateUser(function(options, user) {
	// Default hook's 'profile' behavior.
	if (options.profile) {
	    user.profile = options.profile;
	}
    user.name = 'undefined';
    user.preferredDates = { [year] : {[month] : [] } };
    user.blockOutDates = { [year] : {[month] : [] } };
    user.leaveDates = { [year] : {[month] : [] } };
    user.carriedOverPoints = 0;
    user.allocatedDates = { [year] : {[month] : [] } };
    user.postOutDate = new Date();
    user.team = "undefined";
    user.roles = "normal";
	
	return user;
});


