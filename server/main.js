import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  Meteor.publish("staffCollection", function() {
  	return staffCollection.find();
  });
});
