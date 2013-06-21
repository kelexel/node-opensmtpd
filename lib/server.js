var prime = require('prime')
, mongoose = require('mongoose')
, env = require(__dirname+'/../etc/env.js')
, express = require('express')
, RedisStore = require('connect-redis')(express)
, connect = require('connect')
, stylus = require('stylus')
, nib = require('nib')
, app = express()
, fs = require('fs')
, server = require('http').createServer(app)
, logger = require(__dirname+'/logger.js')
, Auth = require(__dirname+'/auth.js');


var sessionStore = new connect.middleware.session.MemoryStore();

global.logger = logger;

// CORS
// app.all('*', function(req, res, next){
// 	if (!req.get('Origin')) return next();
// 	// use "*" here to accept any origin
// 	res.set('Access-Control-Allow-Origin', '*');
// 	res.set('Access-Control-Allow-Credentials', true);
// 	res.set('Access-Control-Allow-Methods', 'GET, POST');
// 	res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
// 	// res.set('Access-Control-Allow-Max-Age', 3600);
// 	if ('OPTIONS' == req.method) return res.send(200);
// 	next();
// });


// function compile(str, path) {
// 	return stylus(str)
// 	.set('filename', path)
// 	.use(nib())
// }

// express setup
app.configure(function() {

	app.use(express.cookieParser());
	app.use(express.session({secret: env.adminSessionKey}));
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.engine('.html', require('jade').__express);
	// app.use(stylus.middleware(
	// {
	// 	src: __dirname + '/shared/htdocs',
	// 	compile: compile
	// }
	// ));

});


var Server = prime({
	constructor: function(app) {
		logger.info('Starting node-opensmtpd Server on %s:%s', env.adminIP, env.adminPort);
		server.listen(env.adminPort);
		// instantiate the arena object
		var mongoUri = 'mongodb://'+env.mongoIP+':'+env.mongoPort+'/'+env.mongoDB;
		var mongodb = mongoose.connect(mongoUri);
		logger.info('Connected to mongodb');
		mongoose.models = {};
		mongoose.modelSchemas = {};
		
		var auth = new Auth.middleware.Auth({'db': mongodb});
		var acls = new Auth.middleware.ACLs({'db': mongodb});
		var options = {'app': app, 'root': '', 'middleware': [auth, acls]};

		// set the intial MongooseAdmin Singleton
		var admin = new(require(__dirname+'/mongoose-admin.js'))(mongodb, options);

		// load the schema, which calls the MongooseAdmin Singleton...
		require(__dirname+'/schema.js');
	}
});
module.exports = new Server(app);