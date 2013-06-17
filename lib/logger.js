var winston = require('winston');
var env = require(__dirname+'/env.js');
var customLogger = {
		levels: {
			debug: 0,
			verbose: 1,
			info: 2,
			warning: 3,
			error: 4
		},
		colors: {
			debug: 'blue',
			verbose: 'yellow',
			info: 'green',
			warning: 'orange',
			error: 'red'
		}
	};

var logger = new (winston.Logger)({
	levels: customLogger.levels,
	transports : [
		new (winston.transports.Console)({
			json : false,
			timestamp : true,
			colorize: true,
			level: env.logLevel
		}),
		new winston.transports.File({
			filename : 'logs/debug.log',
			json : true,
			level: 'warning',
			maxsize: 10000,
			maxFiles: 10
		})
	],
	exceptionHandlers : [
		new (winston.transports.Console)({
			json : true,
			timestamp : true
		}),
	 new winston.transports.File({
			filename : 'logs/exceptions.log',
			json : false,
			maxsize: 10000,
			maxFiles: 10
		})
	],
	exitOnError : false
});
winston.addColors(customLogger.colors);

module.exports = logger; 