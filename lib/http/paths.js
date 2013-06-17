var routes = require('./routes')
    , routesJson = require('./routes/json')
    , path = require('path');

// [newleafdigital]
//  - added: optional middleware stack before each route
//  - removed: login, logout : parent app should handle auth via route middleware        
exports.registerPaths = function(app, root, middleware) {
    if (root.length > 1) {
        app.get(root, routes.index);
    } else {
        app.get('/', routes.index);
    }
    
    app.get(path.join(root, '/model/:modelName'), middleware, routes.model);
    app.get(path.join(root, '/model/:modelName/document/:documentId'), middleware, routes.document);

    app.get(path.join(root, '/json/documents'), middleware, routesJson.documents);
    app.post(path.join(root, '/json/model/:collectionName/document'), middleware, routesJson.createDocument);
    app.put(path.join(root, '/json/model/:collectionName/document'), middleware, routesJson.updateDocument);
    app.delete(path.join(root,  '/json/model/:collectionName/document'), middleware, routesJson.deleteDocument);
    app.get(path.join(root, '/json/model/:collectionName/linkedDocumentsList'), middleware, routesJson.linkedDocumentsList);
}
