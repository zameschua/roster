import { Template } from 'meteor/templating';
 
import './manageUsers.html';
import { staffCollection } from '/imports/api/staffCollection.js';



Template.manageUsers.helpers({
	admin: function() {
		return Roles.userIsInRole(Meteor.userId(), 'admin');
	},
    staffCollection: function () {
        return staffCollection;
    },
    settings: function(){
	    return{
	      fields: ['name','team','postOutDate','preferredDates','blockOutDates','allocatedDates',
      'carriedOverPoints']
	    };
    }
});