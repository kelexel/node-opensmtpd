var querystring = require('querystring'),
    Url = require('url'),
    sys = require('util'),
    MongooseAdmin = new(require('../../mongoose-admin'))();


exports.documents = function(req, res) {
    var query = querystring.parse(Url.parse(req.url).query);
    MongooseAdmin.modelCounts(query.collection, function(err, totalCount) {
        if (err) {
            res.writeHead(500);
            res.end();
        } else {
            MongooseAdmin.listModelDocuments(query.collection, query.start, query.count, function(err, documents) {
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
    MongooseAdmin.createDocument(adminUser, req.params.collectionName, req.body, function(err, document) {
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
    MongooseAdmin.updateDocument(adminUser, req.params.collectionName, req.body.document_id, req.body, function(err, document) {
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
    var query = querystring.parse(Url.parse(req.url).query);
    MongooseAdmin.deleteDocument(adminUser, req.params.collectionName, query.document_id, function(err) {
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
    MongooseAdmin.getModel(req.params.collectionName, function(err, model, fields, options) {
        if (err) {
            res.writeHead(500);
            res.end();
        } else {
            MongooseAdmin.listModelDocuments(req.params.collectionName, 0, 500, function(err, documents) {
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
