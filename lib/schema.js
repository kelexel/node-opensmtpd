/** 
 * Module dependencies
 */

var mongoose = require('mongoose'),
MongooseAdmin = require(__dirname+'/mongoose-admin.js');


 mongoose.models = {};
 mongoose.modelSchemas = {};
 
/**
 * Schema definition
 */

var MailDomainModel = {
  name: {type: String, required:true},
  alt_name: {type: String, required:true},
  owner: {type: String, required:false},
  created : {type: Date}
};

var MailDomain = new mongoose.Schema(MailDomainModel);
// mongoose.model('MailDomain', MailDomain);

var MailAliasModel = {
  name: {type: String, required:true},
  domain: {type: MailDomainModel},
  created : {type: Date}
};

var MailAlias = new mongoose.Schema(MailAliasModel);
// mongoose.model('MailAlias', MailAlias);

/**
 * Create the admin site on port 8001
 */
var admin = new MongooseAdmin();
// admin.ensureUserExists('admin', 'my-secret-p@ssw0rd');
admin.registerModel('MailDomain', MailDomainModel, {list:['name'], sort:['name']});
admin.registerModel('MailAlias', MailAliasModel, {list:['domain', 'name'], sort:['domain', 'name']});

