'use strict';

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.set('X-Auth-Required', 'true');
	req.session.returnUrl = req.originalUrl;
	res.redirect('/login/');
}

function ensureAdmin(req, res, next) {
	if (req.user.canPlayRoleOf('admin')) {
		return next();
	}
	res.redirect('/');
}

function ensureAccount(req, res, next) {
	if (req.user.canPlayRoleOf('account')) {
		if (req.app.config.requireAccountVerification) {
			if (req.user.roles.account.isVerified !== 'yes' && !/^\/account\/verification\//.test(req.url)) {
				return res.redirect('/account/verification/');
			}
		}
		return next();
	}
	res.redirect('/');
}

exports = module.exports = function(app, passport) {
	//front end
	app.get('/', require('./views/index').init);
	app.get('/about/', require('./views/about/index').init);
	app.get('/contact/', require('./views/contact/index').init);
	app.post('/contact/', require('./views/contact/index').sendMessage);

	//sign up
	app.get('/signup/', require('./views/signup/index').init);
	app.post('/signup/', require('./views/signup/index').signup);

	
	//login/out
	app.get('/login/', require('./views/login/index').init);
	app.post('/login/', require('./views/login/index').login);
	app.get('/login/forgot/', require('./views/login/forgot/index').init);
	app.post('/login/forgot/', require('./views/login/forgot/index').send);
	app.get('/login/reset/', require('./views/login/reset/index').init);
	app.get('/login/reset/:email/:token/', require('./views/login/reset/index').init);
	app.put('/login/reset/:email/:token/', require('./views/login/reset/index').set);
	app.get('/logout/', require('./views/logout/index').init);

	
	//admin
	app.all('/admin*', ensureAuthenticated);
	app.all('/admin*', ensureAdmin);
	app.get('/admin/', require('./views/admin/index').init);

	//admin > mediafiles
	app.get('/admin/mediafiles/', require('./views/admin/mediafiles/index').find);
	app.post('/admin/mediafiles/', require('./views/admin/mediafiles/index').create);
	app.get('/admin/mediafiles/:id/', require('./views/admin/mediafiles/index').read);
	app.get('/admin/mediafiles/:id/actions/', require('./views/admin/mediafiles/index').readActions);
	app.put('/admin/mediafiles/:id/', require('./views/admin/mediafiles/index').update);
	app.delete('/admin/mediafiles/:id/', require('./views/admin/mediafiles/index').delete);

	//admin > users
	app.get('/admin/users/', require('./views/admin/users/index').find);
	app.post('/admin/users/', require('./views/admin/users/index').create);
	app.get('/admin/users/:id/', require('./views/admin/users/index').read);
	app.put('/admin/users/:id/', require('./views/admin/users/index').update);
	app.put('/admin/users/:id/password/', require('./views/admin/users/index').password);
	app.put('/admin/users/:id/role-admin/', require('./views/admin/users/index').linkAdmin);
	app.delete('/admin/users/:id/role-admin/', require('./views/admin/users/index').unlinkAdmin);
	app.put('/admin/users/:id/role-account/', require('./views/admin/users/index').linkAccount);
	app.delete('/admin/users/:id/role-account/', require('./views/admin/users/index').unlinkAccount);
	app.delete('/admin/users/:id/', require('./views/admin/users/index').delete);

	//admin > administrators
	app.get('/admin/administrators/', require('./views/admin/administrators/index').find);
	app.post('/admin/administrators/', require('./views/admin/administrators/index').create);
	app.get('/admin/administrators/:id/', require('./views/admin/administrators/index').read);
	app.put('/admin/administrators/:id/', require('./views/admin/administrators/index').update);
	app.put('/admin/administrators/:id/permissions/', require('./views/admin/administrators/index').permissions);
	app.put('/admin/administrators/:id/groups/', require('./views/admin/administrators/index').groups);
	app.put('/admin/administrators/:id/user/', require('./views/admin/administrators/index').linkUser);
	app.delete('/admin/administrators/:id/user/', require('./views/admin/administrators/index').unlinkUser);
	app.delete('/admin/administrators/:id/', require('./views/admin/administrators/index').delete);

	//admin > admin groups
	app.get('/admin/admin-groups/', require('./views/admin/admin-groups/index').find);
	app.post('/admin/admin-groups/', require('./views/admin/admin-groups/index').create);
	app.get('/admin/admin-groups/:id/', require('./views/admin/admin-groups/index').read);
	app.put('/admin/admin-groups/:id/', require('./views/admin/admin-groups/index').update);
	app.put('/admin/admin-groups/:id/permissions/', require('./views/admin/admin-groups/index').permissions);
	app.delete('/admin/admin-groups/:id/', require('./views/admin/admin-groups/index').delete);

	//admin > accounts
	app.get('/admin/accounts/', require('./views/admin/accounts/index').find);
	app.post('/admin/accounts/', require('./views/admin/accounts/index').create);
	app.get('/admin/accounts/:id/', require('./views/admin/accounts/index').read);
	app.put('/admin/accounts/:id/', require('./views/admin/accounts/index').update);
	app.put('/admin/accounts/:id/user/', require('./views/admin/accounts/index').linkUser);
	app.delete('/admin/accounts/:id/user/', require('./views/admin/accounts/index').unlinkUser);
	app.post('/admin/accounts/:id/notes/', require('./views/admin/accounts/index').newNote);
	app.post('/admin/accounts/:id/status/', require('./views/admin/accounts/index').newStatus);
	app.delete('/admin/accounts/:id/', require('./views/admin/accounts/index').delete);

	//admin > search
	app.get('/admin/search/', require('./views/admin/search/index').find);

	//account
	app.all('/account*', ensureAuthenticated);
	app.all('/account*', ensureAccount);
	app.get('/account/', require('./views/account/index').init);

	//account > verification
	app.get('/account/verification/', require('./views/account/verification/index').init);
	app.post('/account/verification/', require('./views/account/verification/index').resendVerification);
	app.get('/account/verification/:token/', require('./views/account/verification/index').verify);

	//account > settings
	app.get('/account/settings/', require('./views/account/settings/index').init);
	app.put('/account/settings/', require('./views/account/settings/index').update);
	app.put('/account/settings/identity/', require('./views/account/settings/index').identity);
	app.put('/account/settings/password/', require('./views/account/settings/index').password);

	//route not found
	app.all('*', require('./views/http/index').http404);
};
