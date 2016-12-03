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