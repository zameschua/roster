import { Meteor } from 'meteor/meteor';


Meteor.startup(() => {
  Meteor.publish("allUsers", function() {
  	return Meteor.users.find();
  });
});


Meteor.methods({
	deleteUser: function(id) {
		Meteor.users.remove(id);
	},
	updateUser: function(id, obj) {
		Meteor.users.update({_id: id}, {$set: obj});
	}
});

Accounts.onCreateUser(function(options, user) {
	// Default hook's 'profile' behavior.
	if (options.profile) {
	    user.profile = options.profile;
	}

    user.name = "undefined";
    user.preferredDates = [];
    user.blockOutDates = [];
    user.carriedOverPoints = 0;
    user.allocatedDates = [],
    user.postOutDate = new Date();
    user.team = "undefined";
    user.role = "normal";


	console.log(user);
	return user;
});


