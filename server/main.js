import { Meteor } from 'meteor/meteor';

import { staffCollection } from '/imports/api/staffCollection.js';


Meteor.startup(() => {
  Meteor.publish("staffCollection", function() {
  	return staffCollection.find();
  });
});


Meteor.methods({
	deleteUser: function(id) {
		//Meteor.users.remove(id); !Add this back in after setting up accounts properly
		staffCollection.remove(id);
	},
	updateUser: function(id, obj) {
		staffCollection.update({_id: id}, {$set: obj});
	}
});

Accounts.onCreateUser(function(options, user) {
	// Default hook's 'profile' behavior.
	if (options.profile) {
	    user.profile = options.profile;
	}

	// Add user to staffCollection
	staffCollection.insert({
		meteorId: user._id,
	});

	return user;
});


