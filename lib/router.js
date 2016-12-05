Accounts.onLogin(function() {
	FlowRouter.go('dashboard');
});

Accounts.onLogout(function() {
	FlowRouter.go('login');
});


var exposed = FlowRouter.group();
var loggedIn = FlowRouter.group({
  triggersEnter: [function(context, redirect) {
	if (Meteor.userId() || Meteor.loggingIn()) {
		;
	} else {
		FlowRouter.go("login");
	}
  }]
});

var admin = FlowRouter.group({
  triggersEnter: [function(context, redirect) {
	if (Roles.userIsInRole(Meteor.userId(), 'admin')) {
		;
	} else {
		FlowRouter.go("dashboard");
	}
  }]
});

FlowRouter.route('/', {
    action: function(params, queryParams) {
    	if (Meteor.userId()) {
    		FlowRouter.go('dashboard');
    	} else {
    		FlowRouter.go("login");
    	}
    }
});

exposed.route('/login', {
	name: "login",
    action: function(params, queryParams) {
    	BlazeLayout.render("login");
    }
});

loggedIn.route('/dashboard', {
	name: "dashboard",
    action: function(params, queryParams) {
        BlazeLayout.render("dashboard");
    }
});

loggedIn.route('/submit', {
	name: "submit",
    action: function(params, queryParams) {
        BlazeLayout.render("submit");
    }
});

admin.route('/planRoster', {
	name: "planRoster",
    action: function(params, queryParams) {
        BlazeLayout.render("planRoster");
    }
});

admin.route('/manageUsers', {
	name: "manageUsers",
    action: function(params, queryParams) {
        BlazeLayout.render("manageUsers");
    }
});