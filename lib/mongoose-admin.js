/*!
 * Mangoose Admin Prime
 * Copyright (c) 2013 Rudolph Sand (rudolph.sand@gmail.com)
 * MIT Licensed
 *
 * Changed from original:
 *			- added prime
 *			- refactored for my needs
 *			- highly experimental
 *			- un-tested !!!
 *			- not thorouly tested on node 0.10.x (0.10.6)
 * 
 * Based on:
 * Mongoose Admin - newleafdigital FORK
 * Project URL: https://github.com/newleafdigital/mongoose-admin/tree/refactor
 * Notes from Author:
 *		"I have forked marccampbell's original repo and made several changes. The documentation and examples no longer apply to the changed code. Do not use this fork unless you are aware of the changes"
 *		changed from original:
 *			- createAdmin: removed option for port :  only use existing app
 *			- createAdmin: dbUri -> db  :  pass existing connection instead of creating new one
 *			- createAdmin: options can now take 'middleware': an array of route middleware callbacks
 *			- removed adminUser: parent app should handle admin auth on it sown, via route middleware
 *
 * Based on:
 * Mongoose Admin
 * Copyright (c) 2011 Marc Campbell (marc.e.campbell@gmail.com)
 * MIT Licensed
 */


 /**
  * Module dependencies
  */
var sys = require('util'),
	prime = require('prime'),
	MongooseAdminAudit = require(__dirname+'/mongoose-admin-audit.js'),
	mongoose = require('mongoose');

exports.version = '0.0.1';


/** 
 * Create the admin singleton object
 *
 * @param {String} dbUri
 * @param {Number} port
 *
 * @api public
 */

var _instance = false;
/** 
 * Create the admin singleton object
 *
 * @param {String} db  existing DB connection. (changed from dbUri)
 *
 * @api public
 */
var MangooseAdmin = prime({
	_models: false,
	_root: false,
	_app: false,
	/**
	 * MongooseAdmin Constructor
	 *
	 * @api public
	 */
	constructor: function(dbUri, options) {
		if (_instance) return _instance;
		console.log('Instantiate');
		console.log(options ? 'true' : 'false');
		if (dbUri && options && options.app && options.root) {
			mongoose.connect(dbUri);
			console.log('\x1b[36mMongooseAdmin is listening at path: \x1b[0m %s', options.root);
			require(__dirname+'/http/paths.js').registerPaths(options.app, '/' + options.root, options.middleware || []);
			options.app.use(require('express').static(__dirname + '/http/static'));
			this._app = options.app;
			this._root = options.root;
			this._models = {};
			// options.app.use(require('express').static(__dirname + '/http/static'));
			_instance = this;
		}
	},

	/**
	 * Build a full path that can be used in a URL
	 *
	 * @param {String} path
	 */
	_buildPath: function(path) {
		return this._root + path;
	},

	/**
	 * Push the mongoose-admin express config to the current config
	 *
	 * @api public
	 */
	pushExpressConfig: function() {
	//	var currentViewsPath = MongooseAdmin.singleton.app.set('views');
		var currentViewsPath = _instance._app.set('views');
		_instance._app.set('views', __dirname + '/http/views');
		return {'views': currentViewsPath};
	},

	/**
	 * Replace the mongoose-admin express config with the original
	 */
	_popExpressConfig: function(config) {
		this._app.set('views', config.views);
	},

	/**
	 * Stop listening and end the admin process
	 *
	 * @api public
	 */
	_close: function() {
		this._app.close();
	},

	/** 
	 * Register a new mongoose model/schema with admin
	 *
	 * @param {String} adminModelName
	 * @param {Object} fields
	 * @param {Object} options
	 *
	 * @api public
	 */
	registerModel: function(adminModelName, schema, options) {
		var fields = schema.tree;

		var model = mongoose.model(adminModelName, schema);
		this._models[model.collection.name] = {model: model,
										  options: options,
										  fields: fields};
		console.log('\x1b[36mMongooseAdmin registered model: \x1b[0m %s', adminModelName);
	},

	/** 
	 * Retrieve a list of all registered models
	 *
	 * @param {Function} onReady
	 *
	 * @api public
	 */
	getRegisteredModels: function(onReady) {
		var models = [];
		for (collectionName in this._models) {
			models.push(this._models[collectionName].model);
		};
		onReady(null, models);
	},

	/**
	 * Get a single model from the registered list with admin
	 *
	 * @param {String} collectionName
	 * @param {Function} onReady
	 *
	 * @api public
	 */
	getModel: function(collectionName, onReady) {
		onReady(null, this._models[collectionName].model, this._models[collectionName].fields, this._models[collectionName].options);
	},

	/** 
	 * Get the counts of a model
	 * 
	 * @param {String} collectionName
	 *
	 * @api public
	 */
	modelCounts: function(collectionName, onReady) {
		this._models[collectionName].model.count({}, function(err, count) {
			if (err) {
				console.log('Unable to get counts for model because: ' + err);
			} else {
				onReady(null, count);
			}
		});
	},

	/**
	 * List a page of documents from a model
	 *
	 * @param {String} collectionName
	 * @param {Number} start
	 * @param {Number} count
	 * @param {Function} onReady
	 *
	 * @api public
	 */
	listModelDocuments: function(collectionName, start, count, onReady) {
		var listFields = this._models[collectionName].options.list;
		this._models[collectionName].model.find({}).skip(start).limit(count).execFind(function(err, documents) {
			if (err) {
				console.log('Unable to get documents for model because: ' + err);
				onReady('Unable to get documents for model', null);
			} else {
				var filteredDocuments = [];
				documents.forEach(function(document) {
					var d = {};
					d['_id'] = document['_id'];
					listFields.forEach(function(listField) {
					  d[listField] = document[listField];
					});
					filteredDocuments.push(d);
				});

				onReady(null, filteredDocuments);
			}
		});
	},

	/** 
	 * Retrieve a single document
	 * 
	 * @param {String} collectionName
	 * @param {String} documentId
	 * @param {Function} onReady
	 *
	 * @api public
	 */
	getDocument: function(collectionName, documentId, onReady) {
		this._models[collectionName].model.findById(documentId, function(err, document) {
			if (err) {
				console.log('Unable to get document because: ' + err);
				onReady('Unable to get document', null);
			} else {
				onReady(null, document);
			}
		});
	},

	/** 
	 * Create a new document
	 *
	 * @param {String} collectionName
	 * @param {Object} params
	 * @param {Function} onReady
	 *
	 * @api public
	 */
	createDocument: function(user, collectionName, params, onReady) {
		var self = this;
		var model = this._models[collectionName].model;
		var document = new model();

		for (field in this._models[collectionName].fields) {
			if (params[field]) {
				document[field] = params[field];
			} else {
				if (params[field + '_linked_document']) {
					document[field] = mongoose.Types.ObjectId.fromString(params[field + '_linked_document']);
				}
			}
		}

		if (this._models[collectionName].options && this._models[collectionName].options.pre) {
			document = this._models[collectionName].options.pre(document);
		}

		document.save(function(err) {
			if (err) {
				console.log('Error saving document: ' + err);
				onReady('Error saving document: ' + err);
			} else {

				if (self._models[collectionName].options && self._models[collectionName].options.post) {
					document = self._models[collectionName].options.post(document);
				}
				MongooseAdminAudit.logActivity(user, self._models[collectionName].adminModelName, collectionName, document._id, 'add', null, function(err, auditLog) {
					onReady(null, document);
				});
			}
		});
	},

	/**
	 * Update a document
	 *
	 * @param {String} collectionName
	 * @param {String} documentId
	 * @param {Object} params
	 * @param {Function} onReady
	 *
	 * @api public
	 */
	updateDocument: function(user, collectionName, documentId, params, onReady) {
		var self = this;
		var fields = this._models[collectionName].fields;
		var model = this._models[collectionName].model;
		model.findById(documentId, function(err, document) {
			if (err) {
				console.log('Error retrieving document to update: ' + err);
				onReady('Unable to update', null);
			} else {
				for (field in fields) {
					if (params[field]) {
						console.log(params['field'])
						// hack to handle booleans
						if (params[field] == 'true'){
							params[field] = true
						} else if (params[field] == 'false'){
							params[field] = false
						}
						
						document[field] = params[field];
					} else {
						if (params[field + '_linked_document']) {
							document[field] = mongoose.Types.ObjectId.fromString(params[field + '_linked_document']);
						}                    
					}
				}

				if (self._models[collectionName].options && self._models[collectionName].options.pre) {
					document = self._models[collectionName].options.post(document);
				}

				document.save(function(err) {
					if (err) {
						console.log('Unable to update document: ' + err);
						onReady('Unable to update docuemnt', null);
					} else {

						if (self._models[collectionName].options && self._models[collectionName].options.post) {
							document = self._models[collectionName].options.post(document);
						}
						MongooseAdminAudit.logActivity(user, self._models[collectionName].adminModelName, collectionName, document._id, 'edit', null, function(err, auditLog) {
							onReady(null, document);
						});
					}
				});
			}
		});
	},

	/**
	 * Delete, remove a document
	 *
	 * @param {String} collectionName
	 * @param {String} documentId
	 * @param {Function} onReady
	 *
	 * @api public
	 */
	deleteDocument: function(user, collectionName, documentId, onReady) {
		var self = this;
		var model = this._models[collectionName].model;
		model.findById(documentId, function(err, document) {
			if (err) {
				console.log('Error retrieving document to delete: ' + err);
				onReady('Unable to delete');
			} else {
				if (!document) {
					onReady('Document not found');
				} else {
					document.remove();
					MongooseAdminAudit.logActivity(user, self._models[collectionName].adminModelName, collectionName, documentId, 'del', null, function(err, auditLog) {
						onReady(null);
					});
				}
			}
		});
	}
});


module.exports = function(dbUri, options) { 
	return _instance ? _instance : new MangooseAdmin(dbUri, options);
};

