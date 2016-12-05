export const staffCollection = new Mongo.Collection("staffCollection");

staffCollection.schema = new SimpleSchema({
  meteorId: {type: String, label: 'Meteor Id'},
  name: {type: String, label: 'name', defaultValue: "undefined"},
  preferredDates: {type: [Number], label: 'preferred dates', defaultValue: []},
  blockOutDates: {type: [Number], label: 'block-out dates', defaultValue: []},
  carriedOverPoints: {type: Number, label: 'carried over points', defaultValue: 0},
  allocatedDates: {type: [Number], label: 'allocated dates', defaultValue: []},
  postOutDate: {type: Date, label: 'post out date', defaultValue: new Date()},
  team: {type: String, label: 'team', defaultValue: "undefined"},
});

staffCollection.attachSchema(staffCollection.schema);