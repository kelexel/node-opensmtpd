var Mongoose = require('mongoose'),
Troop = require('mongoose-troop'),
env = require(__dirname+'/../etc/env.js');

module.exports.Helper = {
	authenticate: function(req, res, admin) {
		admin.getModel('mailadmins', function(err, adminModel, fields, options) {
		if (err) {
			res.writeHead(500);
			res.end();
			// throw err;
		}
		adminModel.authenticate(req.body.username, req.body.password, function(err, doc) {
			if (err) {
				admin.getModel('mailpostmasters', function(err, postmasterModel, fields, options) {
					 if (err) {
						res.writeHead(500);
						res.end();
						// throw err;
					}
					postmasterModel.authenticate(req.body.username, req.body.password, function(err, doc){
						if (err) {
							admin.getModel('mailusers', function(err, userModel, fields, options) {
								if (err) {
									res.writeHead(500);
									res.end();
								}
								userModel.authenticate(req.body.username, req.body.password, function(err, doc){
									if (err) {
										res.writeHead(200, {"Content-Type": "application/json"});
										res.write(JSON.stringify({'auth': 'error', 'log': 'Invalid credentials!'}));
										res.end();
									} else {
										req.session._set = true;
										req.session._group = 'mailusers';
										res.writeHead(200, {"Content-Type": "application/json"});
										res.write(JSON.stringify({'auth': 'ok', 'log': 'Welcome user!'}));
										res.end();
									}
								});
							});
						} else {
							req.session._set = true;
							req.session._group = 'mailpostmasters';
							res.writeHead(200, {"Content-Type": "application/json"});
							res.write(JSON.stringify({'auth': 'ok', 'log': 'Welcome postmaster!'}));
							res.end();
						}
					});
				});
			} else {
				req.session._set = true;
				req.session._group = 'mailadmins';
				res.writeHead(200, {"Content-Type": "application/json"});
				res.write(JSON.stringify({'auth': 'ok', 'log': 'Welcome admin!'}));
				res.end();
			}
		});
	});
	},
	'logout': function(req, res, admin) {
		req.session._set = false;
		req.session._group = false;
		res.redirect(env.url);
	}
}


module.exports.middleware = {
	Auth: function(options) {
		return function Auth(req, res, next) {
			next(); return;
			if (!req.session._set && req.route.path != '/json/login') {
				res.redirect(env.url);
			} else if (!req.session._set && req.route.path == '/json/login') {
				next();
			} else
				next();
		}
	},
	ACLs: function(options) {
		return function ACLs(req, res, next) {
			if (!req.session._set) {
			}
			next();
		}
	}
}