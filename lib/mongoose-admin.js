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
	object = require('prime/shell/object'),
	MongooseAdminAudit = new(require(__dirname+'/mongoose-admin-audit.js')),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	forms = require('forms-mongoose');
	// rbac = require('mongoose-rbac');
exports.version = '0.0.1';


/** 
 * Create the admin singleton object
 *
 * @param {Number} port
 *
 * @api public
 */

// if (!global._instance) = false;
var _instance;
/** 
 * Create the admin singleton object
 *
 * @param {String} db  existing DB connection. (changed from dbUri)
 *
 * @api public
 */
var MongooseAdmin = prime({
	_models: false,
	_root: false,
	_app: false,
	_db: false,
	/**
	 * MongooseAdmin Constructor
	 *
	 * @api public
	 */
	constructor: function(db, options) {
		if (db && options && options.app) {
			_instance = this;
 			this._models = {};
			// require(__dirname+'/schema.js');

			logger.info('\x1b[36mMongooseAdmin is listening at path: \x1b[0m %s', options.root);
			require(__dirname+'/http/paths.js').registerPaths(options.app, (options.root == '' ? '/' : ''), options.middleware || []);
			options.app.use(require('express').static(__dirname + '/http/static'));
			this._db = db;
			this._app = options.app;
			this._root = options.root;
			// options.app.use(require('express').static(__dirname + '/http/static'));
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
	 * Get the mongoose-db object
	 *
	 * @api public
	 */
	 getDB: function() {
	 	return this._db;
	 },
	/**
	 * Get the mongoose-admin express root setting
	 *
	 * @api public
	 */
	 getRoot: function() {
	 	return this._root;
	 },
	/**
	 * Push the mongoose-admin express config to the current config
	 *
	 * @api public
	 */
	pushExpressConfig: function() {
		// var currentViewsPath = MongooseAdmin.singleton.app.set('views');
		var currentViewsPath = this._app.set('views');
		this._app.set('views', __dirname + '/http/views');
		return {'views': currentViewsPath};
	},

	/**
	 * Replace the mongoose-admin express config with the original
	 *
	 * @api public
	 */
	popExpressConfig: function(config) {
		this._app.set('views', config.views);
	},

	/**
	 * Stop listening and end the admin process
	 *
	 * @api public
	 */
	close: function() {
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
	registerModel: function(adminModelName, fields, options) {

		var schema = new Schema(fields);

		if (options.plugins && options.plugins.length >0)
			options.plugins.forEach(function(plugin){
				schema.plugin(plugin);
			})

		var model = mongoose.model(adminModelName, schema);

		this._models[model.collection.name] = {model: model,
										  options: options,
										  fields: fields};
		logger.info('\x1b[36mMongooseAdmin registered model: \x1b[0m %s', adminModelName);
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
				logger.warn('Unable to get counts for model because: ' + err);
			} else {
				onReady(null, count);
			}
		});
	},

	/**
	 * List a page of documents from a model
	 *
	 * @param {String} collectionName
	 *
	 * @api public
	 */
	 getPopullation: function(collectionName) {
	 	return this._models[collectionName].options.popullation ? this._models[collectionName].options.popullation : [];
	 },
	/**
	 * List a page of fields from a document
	 *
	 * @param {Array} listFields
	 * @param {Array} documents
	 *
	 * @api private
	 */
	 _filterDocuments: function(listFields, documents) {
	 	var filteredDocuments = [];
		documents.forEach(function(document) {
			var d = {};
			d['_id'] = document['_id'];
			listFields.forEach(function(listField) {
			  d[listField] = document[listField];
			});
			filteredDocuments.push(d);
		});
		return filteredDocuments;
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
		var pop = this.getPopullation(collectionName);
		var _model = this._models[collectionName].model;
		var self = this;
		// this._models[collectionName].model.find({}).skip(start).limit(count).execFind(function(err, documents) {
		_model.find({}).skip(start).limit(count).execFind(function(err, documents) {
			if (err) {
				logger.warn('Unable to get documents for model because: ' + err);
				onReady('Unable to get documents for model', null);
			} else {
					// return onReady(null, documents);

				if (!pop || pop.length == 0) 
					return onReady(null, self._filterDocuments(listFields, documents));

				_model.populate(documents, pop, function(err, documents) {
					if (err) {
						logger.warn('Unable to get documents for model because: ' + err);
						onReady('Unable to get documents for model', null);
					} else {
						// var filteredDocuments = [];
						// documents.forEach(function(document) {
						// 	var d = {};
						// 	d['_id'] = document['_id'];
						// 	listFields.forEach(function(listField) {
						// 	  d[listField] = document[listField];
						// 	});
						// 	filteredDocuments.push(d);
						// });
						onReady(null, self._filterDocuments(listFields, documents));
					}
				});
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
				logger.warn('Unable to get document because: ' + err);
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
				logger.error('Error saving document: ' + err);
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
				logger.error('Error retrieving document to update: ' + err);
				onReady('Unable to update', null);
			} else {
				for (field in fields) {
					if (params[field]) {
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
						logger.warn('Unable to update document: ' + err);
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
				logger.error('Error retrieving document to delete: ' + err);
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

module.exports = function(db, options) {
	return _instance ? _instance : new MongooseAdmin(db, options);
};