var querystring = require('querystring'),
	Url = require('url'),
	sys = require('util'),
	admin = new (require(__dirname+'/../../mongoose-admin.js')),
	auth = require(__dirname+'/../../auth.js');

exports.logout = function(req, res) {
	auth.Helper.logout(req, res, admin);
};

exports.login = function(req, res) {
	auth.Helper.authenticate(req, res, admin);
};

exports.documents = function(req, res) {
	var query = querystring.parse(Url.parse(req.url).query);
	admin.modelCounts(query.collection, function(err, totalCount) {
		if (err) {
			res.writeHead(500);
			res.end();
		} else {
			var scope = {};
			admin.listModelDocuments(query.collection, scope, query.start, query.count, function(err, documents) {
				if (err) {
					res.writeHead(500);
					res.end();
				} else {
					res.writeHead(200, {"Content-Type": "application/json"});
					res.write(JSON.stringify({'totalCount': totalCount, 'documents': documents}));
					res.end();
				}
			});
		}
	});
};

exports.createDocument = function(req, res) {
	console.log('create')
	var adminUser = {'fields': {'_id': 1, 'name': 'admin'}};
	admin.createDocument(adminUser, req.params.collectionName, req.body, function(err, document) {
		if (err) {
			res.writeHead(500);
			res.end();
		} else {
			res.writeHead(201, {"Content-Type": "application/json"});
			res.write(JSON.stringify({"collection": req.params.collectionName}));
			res.end();
		}
	});
};

exports.updateDocument = function(req, res) {
	console.log('update')
	var adminUser = {'fields': {'_id': 1, 'name': 'admin'}};
	admin.updateDocument(adminUser, req.params.collectionName, req.body.document_id, req.body, function(err, document) {
		if (err) {
			res.writeHead(500);
			res.end();
		} else {
			res.writeHead(200, {"Content-Type": "application/json"});
			res.write(JSON.stringify({"collection": req.params.collectionName}));
			res.end();
		}
	});
};

exports.deleteDocument = function(req, res) {
	var adminUser = {'fields': {'_id': 1, 'name': 'admin'}};
	var query = querystring.parse(Url.parse(req.url).query);
	admin.deleteDocument(adminUser, req.params.collectionName, query.document_id, function(err) {
		if (err) {
			res.writeHead(500);
			res.end();
		} else {
			res.writeHead(200, {"Content-Type": "application/json"});
			res.write(JSON.stringify({"collection": req.params.collectionName}));
			res.end();
		}
	});
};

exports.linkedDocumentsList = function(req, res) {
	admin.getModel(req.params.collectionName, function(err, model, fields, options) {
		if (err) {
			res.writeHead(500);
			res.end();
		} else {
			var scope = {};
			admin.listModelDocuments(req.params.collectionName, scope, 0, 500, function(err, documents) {
				if (err) {
					res.writeHead(500);
					res.end();
				} else {
					var result = [];
					documents.forEach(function(document) {
						var d = {'_id': document._id};
						options.list.forEach(function(listField) {
							d[listField] = document[listField];
						});
						result.push(d);
					});

					res.writeHead(200, {"Content-Type": "application/json"});
					res.write(JSON.stringify(result));
					res.end();
				}
			});
		}
	});
}
