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
});

Accounts.onCreateUser(function(options, user) {
	// Default hook's 'profile' behavior.
	if (options.profile) {
	    user.profile = options.profile;
	}
    user.name = 'undefined';
    user.preferredDates = [];
    user.blockOutDates = [];
    user.carriedOverPoints = 0;
    user.allocatedDates = [],
    user.postOutDate = new Date();
    user.team = "undefined";
    user.roles = "normal";
	
	return user;
});


