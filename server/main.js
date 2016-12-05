import { Meteor } from 'meteor/meteor';

import { staffCollection } from '/imports/api/staffCollection.js';


Meteor.startup(() => {
  Meteor.publish("staffCollection", function() {
  	return staffCollection.find();
  });
});
