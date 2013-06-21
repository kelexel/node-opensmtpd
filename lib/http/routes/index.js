var querystring = require('querystring'),
	Url = require('url'),
	sys = require('util'),
	admin = new (require(__dirname+'/../../mongoose-admin.js'))
	Renderer = require('../renderer').Renderer,
	prime = require('prime'),
	object = require('prime/shell/object'),
	forms = require('forms-mongoose');

exports.index = function(req, res) {
	admin.getRegisteredModels(function(err, models) {
		if (err) {
			res.redirect('/error');
		} else {
			if (!req.session._set) {
				var config = admin.pushExpressConfig();
				res.render('login', {
						'pageTitle': 'Admin Site',
						// 'models': models,
						'rootPath': admin.getRoot()
				});
				admin.popExpressConfig(config);
			} else {
				var config = admin.pushExpressConfig();
				res.render('models', {
						'pageTitle': 'Admin Site',
						'models': models,
						'rootPath': admin.getRoot()
				});
				admin.popExpressConfig(config);
			}
		}
	});
};


exports.model = function(req, res) {
	var query = querystring.parse(Url.parse(req.url).query);
	var start = query.start ? parseInt(query.start) : 0;
	var count = query.count ? parseInt(query.count) : 50;

	admin.getRegisteredModels(function(err, models) {
		if (err) {
			res.redirect('/');
		} else {
			admin.getModel(req.params.modelName, function(err, model, fields, options) {
				if (err) {
					res.redirect('/error');
				} else {
					admin.modelCounts(req.params.modelName, function(err, totalCount) {
						if (err) {
							res.redirect('/');
						} else {
							admin.listModelDocuments(req.params.modelName, start, count, function(err, documents) {
								if (err) {
									res.redirect('/');
								} else {
									var config = admin.pushExpressConfig();
									res.render('model', {
										'pageTitle': 'Admin - ' + model.modelName,
										'models': models,
										'totalCount': totalCount,
										'modelName': req.params.modelName,
										'model': model,
										'start': start,
										'count': count,
										'listFields': options.list,
										'linkedFields': options.linked,
										'documents': documents,
										'rootPath': admin.getRoot()
									});
									admin.popExpressConfig(config);
								}
							});
						}
					});
				}
			});
		}
	});
};

exports.document = function(req, res) {
	admin.getRegisteredModels(function(err, models) {
		if (err) {
			res.redirect('/');
		} else {
			admin.getModel(req.params.modelName, function(err, model, fields, options) {
				if (err) {
					res.redirect('/error');
				} else {
					if (req.params.documentId === 'new') {
						// Renderer.renderDocument(models, fields, options, null, function(html) {
							var config = admin.pushExpressConfig();
							var form = forms.create(model, null, 'new');
							res.render('document',{
								'pageTitle': 'Admin - ' + model.modelName,
								'models': models,
								'modelName': req.params.modelName,
								'model': model,
								'fields': fields,
								'form': form,
								'action': 'new',
								// 'renderedDocument': html,
								// 'document': {},
								'allowDelete':false,
								'rootPath': admin.getRoot()
							});
							admin.popExpressConfig(config);
						// });
					} else {
						admin.getDocument(req.params.modelName, req.params.documentId, function(err, document) {
							if (err) {
								res.redirect('/error');
							} else {
								// Renderer.renderDocument(models, fields, options, document, function(html) {
									var config = admin.pushExpressConfig();
									var form = forms.create(document, null, 'edit');
									res.render('document', {
										'pageTitle': 'Admin - ' + model.modelName,
										'models': models,
										'modelName': req.params.modelName,
										'model': model,
										'form': form,
										'action': 'edit',
										'fields': fields,
										// 'renderedDocument': html,
										// 'document': document,
										'allowDelete': true,
										'rootPath': admin.getRoot()
									});
									admin.popExpressConfig(config);
								// });
							}
						});
					}
				}
			});
		}
	});
};

