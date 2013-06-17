var querystring = require('querystring'),
    Url = require('url'),
    sys = require('util'),
    MongooseAdmin = new(require('../../mongoose-admin'))();
    Renderer = require('../renderer').Renderer;

exports.index = function(req, res) {
    MongooseAdmin.getRegisteredModels(function(err, models) {
        if (err) {
            res.redirect('/error');
        } else {
            var config = MongooseAdmin.pushExpressConfig();
            res.render('models',
                       {layout: 'adminlayout.jade',
                        locals: {
                            'pageTitle': 'Admin Site',
                            'models': models,
                            'rootPath': MongooseAdmin.root
                        }
                       });
            MongooseAdmin.popExpressConfig(config);
        }
    });
};


exports.model = function(req, res) {
    var query = querystring.parse(Url.parse(req.url).query);
    var start = query.start ? parseInt(query.start) : 0;
    var count = query.count ? parseInt(query.count) : 50;

    MongooseAdmin.getRegisteredModels(function(err, models) {
        if (err) {
            res.redirect('/');
        } else {
            MongooseAdmin.getModel(req.params.modelName, function(err, model, fields, options) {
                if (err) {
                    res.redirect('/error');
                } else {
                    MongooseAdmin.modelCounts(req.params.modelName, function(err, totalCount) {
                        if (err) {
                            res.redirect('/');
                        } else {
                            MongooseAdmin.listModelDocuments(req.params.modelName, start, count, function(err, documents) {
                                if (err) {
                                    res.redirect('/');
                                } else {
                                    var config = MongooseAdmin.pushExpressConfig();
                                    res.render('model',
                                               {layout: 'adminlayout.jade',
                                                locals: {
                                                    'pageTitle': 'Admin - ' + model.modelName,
                                                    'models': models,
                                                    'totalCount': totalCount,
                                                    'modelName': req.params.modelName,
                                                    'model': model,
                                                    'start': start,
                                                    'count': count,
                                                    'listFields': options.list,
                                                    'documents': documents,
                                                    'rootPath': MongooseAdmin.root
                                                }
                                               });
                                    MongooseAdmin.popExpressConfig(config);
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
    MongooseAdmin.getRegisteredModels(function(err, models) {
        if (err) {
            res.redirect('/');
        } else {
            MongooseAdmin.getModel(req.params.modelName, function(err, model, fields, options) {
                if (err) {
                    res.redirect('/error');
                } else {
                    if (req.params.documentId === 'new') {
                        Renderer.renderDocument(models, fields, options, null, function(html) {
                            var config = MongooseAdmin.pushExpressConfig();
                            res.render('document',
                                       {layout: 'adminlayout.jade',
                                        locals: {
                                            'pageTitle': 'Admin - ' + model.modelName,
                                            'models': models,
                                            'modelName': req.params.modelName,
                                            'model': model,
                                            'fields': fields,
                                            'renderedDocument': html,
                                            'document': {},
                                            'allowDelete':false,
                                            'rootPath': MongooseAdmin.root
                                       }
                                      });
                            MongooseAdmin.popExpressConfig(config);
                        });
                    } else {
                        MongooseAdmin.getDocument(req.params.modelName, req.params.documentId, function(err, document) {
                            if (err) {
                                res.redirect('/error');
                            } else {
                                Renderer.renderDocument(models, fields, options, document, function(html) {
                                    var config = MongooseAdmin.pushExpressConfig();
                                    res.render('document',
                                               {layout: 'adminlayout.jade',
                                                locals: {
                                                   'pageTitle': 'Admin - ' + model.modelName,
                                                   'models': models,
                                                   'modelName': req.params.modelName,
                                                   'model': model,
                                                   'fields': fields,
                                                   'renderedDocument': html,
                                                   'document': document,
                                                   'allowDelete': true,
                                                   'rootPath': MongooseAdmin.root
                                               }
                                             });
                                    MongooseAdmin.popExpressConfig(config);
                                });
                            }
                        });
                    }
                }
            });
        }
    });
};

