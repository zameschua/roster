const Schema = {};

Schema.User = new SimpleSchema({
    emails: {
        type: Array,
        optional: true
    },
    "emails.$": {
        type: Object
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    createdAt: {
        type: Date
    },
    profile: {
        type: Schema.UserProfile,
        optional: true
    },
    // For external sign in services ie. Facebook or Google
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    roles: {
        type: String,
        optional: true
    },
    'roles.$': {
        type: String
    },
    // In order to avoid an 'Exception in setInterval callback' from Meteor
    heartbeat: {
        type: Date,
        optional: true
    },
    name: {type: String, label: 'name', defaultValue: "undefined"},
    preferredDates: {type: Object, label: 'preferred dates', defaultValue: {}},
    blockOutDates: {type: Object, label: 'block-out dates', defaultValue: {}},
    carriedOverPoints: {type: Number, label: 'carried over points', defaultValue: 0},
    allocatedDates: {type: Object, label: 'allocated dates', defaultValue: {}},
    postOutDate: {type: Date, label: 'post out date', defaultValue: new Date()},
    team: {type: String, label: 'team', defaultValue: "undefined"},
});

Meteor.users.attachSchema(Schema.User);