var prime = require('prime')
, env = require(__dirname+'/../etc/env.js')
, mongoose = require('mongoose')
, Troop = require('mongoose-troop')

var MailAdminModel


var Shell = prime({
	constructor: function(app) {
		// instantiate the arena object
		var dbUri = 'mongodb://'+env.mongoIP+':'+env.mongoPort+'/'+env.mongoDB;
		var db = mongoose.connect(dbUri);
		this.createAdmin();
	},
	_loadUserSchema: function() {
		if (!MailAdminModel) {
			var MailAdminSchema = new mongoose.Schema();
			MailAdminSchema.plugin(Troop.basicAuth)
			MailAdminModel = mongoose.model('MailAdmin', MailAdminSchema)
		}
		return MailAdminModel
	},
	createAdmin: function() {
		this._loadUserSchema();
		MailAdminModel.register({username: 'admin', password: '1234'}, function(err, res) {
			if (err) console.log(err);
			else console.log('admin user created')
		});
	}
});

module.exports = new Shell();