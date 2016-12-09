Template.login.events({
	'click #login-wrapper .btn-fab': function(e) {
		e.stopPropagation();
        $('#login-wrapper .btn-fab').parents('.card').toggleClass('active');
	},
	'click #register': function() {
		var email = $('#register-email').val();
		var password = $('#register-password').val();
		var options = {
			email: email,
			password: password,
		}
		Accounts.createUser(options, function(e) {
			if (e) {
				alert(e + "Please contact admin for help!"); // If error on create
			}
		});
	},
	'click #login': function() {
		var email = $('#login-email').val();
		var password = $('#login-password').val();
		Meteor.loginWithPassword(email, password, function(e) {
			if (e) {
				alert(e + "Please contact admin for help!"); // If error on create
			}
		});
	}
})

