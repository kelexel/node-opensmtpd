var prime = require('prime')
, env = require(__dirname+'/../etc/env.js');


module.exports = prime({
	constructor: function(server) {
		// instantiate the arena object
		var dbUri = 'mongodb://'+env.mongoIP+':'+env.mongoPort+'/'+env.mongoDB;
		var options = {'app': server, 'root': 'foo'};

		// set the intial MongooseAdmin Singleton
		var admin = new(require(__dirname+'/mongoose-admin.js'))(dbUri, options);

		// load the schema, which calls the MongooseAdmin Singleton...
		require(__dirname+'/schema.js');
	}
});