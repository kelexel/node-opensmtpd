// Use with something like:
//	env NODE_ENV='dev' node app.js
//	env NODE_ENV='prod' node app.js



var env = require(__dirname+'/etc/env.js')
, express = require('express')
, RedisStore = require('connect-redis')(express)
, connect = require('connect')
, stylus = require('stylus')
, nib = require('nib')
, app = express()
, fs = require('fs')
, server = require('http').createServer(app)
, logger = require(__dirname+'/lib/logger.js');

require('prime');


var sessionStore = new connect.middleware.session.MemoryStore();

global.logger = logger;

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

// just listen.
if (!(env.listenPort)) throw Error('Something is wrong with lib/env.js !');

function compile(str, path) {
	return stylus(str)
	.set('filename', path)
	.use(nib())
}

// express setup
app.configure(function() {
	// // set an express cookie + session, not really used for now
	// app.use(express.cookieParser(env.sessionKey));
	// // app.set('views', __dirname + '/lib/views');
	app.set('view engine', 'jade');
	// app.use(express.bodyParser());
	// app.use(express.methodOverride());
	// app.use(express.session({ secret: env.sessionKey, store: sessionStore }));
	// app.use(app.router);
	// // serve up static file if found
	// app.engine('.html', require('jade').__express);

	// app.use(stylus.middleware(
	// {
	// 	src: __dirname + '/shared/htdocs',
	// 	compile: compile
	// }
	// ));

});
server.listen(env.listenPort);
logger.info('Starting node-opensmtpd Server on port', env.listenPort);


var worker = new (require(__dirname+'/lib/server.js'))(app);


