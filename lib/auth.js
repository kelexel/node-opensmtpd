var Mongoose = require('mongoose'),
Troop = require('mongoose-troop'),
env = require(__dirname+'/../etc/env.js'),
async = require('async');

module.exports.Helper = {
	_authModels: ['mailadmins', 'mailpostmasters', 'mailusers'],
	modelFetch: function(locales, modelName, callback) {
			locales.admin.getModel(modelName, function modelFetch(err, model, fields, options) {
			if (err) {
				callback('Cannot fetch model '+modelName, locales);
			} else {
				locales.modelName = modelName;
				locales.model = model;
				locales.fields = fields;
				locales.options = options;
				callback(false, locales);
			}
		});
	},
	modelAuthenticate: function(locales, callback) {
		locales.model.authenticate(locales.credentials.username, locales.credentials.password, function modelAuthenticate(err, model) {
			if (err) {
				locales.model = false;
			} else {
				locales.model = model;
			}
			callback(false, locales);
		})
	},
	chain: function(locales, callback) {
		if (locales.model) return callback(null, locales);
		var modelName = this._authModels[locales.count];
		locales.count++;
		async.waterfall([
			this.modelFetch.bind(this, locales, modelName),
			this.modelAuthenticate.bind(this)
		], function(err, locales){
			if (err) throw Error(err);
			callback(null, locales)
		});
	},
	process: function(req, res, err, locales) {
		// console.log(locales.model)
		if (err) throw Error(err);
		else if (!locales.model._id) {
			res.writeHead(200, {"Content-Type": "application/json"});
			res.write(JSON.stringify({'auth': 'error', 'log': 'Invalid credentials!'}));
			res.end();
		} else {
			req.session._set = true;
			req.session._user = locales.model;
			res.writeHead(200, {"Content-Type": "application/json"});
			res.write(JSON.stringify({'auth': 'ok', 'log': 'Welcome postmaster!'}));
			res.end();
		}
	},
	authenticate: function(req, res, admin, callback) {
		var locales = {credentials: {username: req.body.username, password: req.body.password}, admin: admin, count: 0, model: false};
		var count = 0;
		async.waterfall([
			this.chain.bind(this, locales),
			this.chain.bind(this),
			this.chain.bind(this),
		], this.process.bind(this, req, res));
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