/** 
 * Module dependencies
 */

var mongoose = require('mongoose'),
	admin = new (require(__dirname+'/mongoose-admin.js'));
	// rbac = require('mongoose-rbac');
	var Troop = require('mongoose-troop')

var types = {
	email: mongoose.SchemaTypes.Email,
	objectId: mongoose.Schema.ObjectId
};

var toLower = function toLower (v) {
  return v.toLowerCase();
}
/**
 * Schema definition
 */


/**
 * AuditData
 */
var AuditData = new mongoose.Schema({
	created: {type:Date, required:true, default:new Date},
	user: {type:types.objectId, required:true},
	adminModelName: {type:String},
	collectionName: {type:String},
	documentId: {type:types.objectId},
	action: {type:String, required:true},
	note: {type:String}
});
mongoose.model('_MongooseAdminAudit', AuditData);

/**
 * MailAdmin
 */
var MailAdminDefinition = {
	// first: {type: String, required:true},
	// last: {type: String, required:true},
	username: {type: String, set: toLower, required: true, index: {unique: true}, forms: { 'all': {type: 'email', widget: forms.widgets.text(), required: true, label: 'Email'}}},
	hash: {type: String, required: true, forms: {'all': {type: 'password', widget: forms.widgets.password(), required: true, label: 'Password'}}}
};
// MailAdmin.plugin(rbac.plugin);
admin.registerModel('MailAdmin', MailAdminDefinition, {list:['username'], sort:['username'], plugins: [Troop.basicAuth, Troop.timestamp]});

/**
 * Schema definition
 */
 /**
 * mailPostmaster
 */
var MailPostmasterDefinition = {
	username: {type: String, required:true, set: toLower, index: {unique: true}, forms: { 'all': {type: 'email', widget: forms.widgets.text(), required: true, label: 'Email'}}},
	hash: {type: String, required: true, forms: {'all': {type: 'password', widget: forms.widgets.password(), required: true, label: 'Password'}}}
};
admin.registerModel('MailPostmaster', MailPostmasterDefinition, {list:['username'], sort:['username'], plugins: [Troop.basicAuth, Troop.timestamp]});

 /**
 * MailDomainModel
 */
var MailDomainDefinition = {
	domain: {type: String, required:true, set: toLower,  index: {unique: true}, forms: { 'all': {type: 'string', widget: forms.widgets.text(), required: true, label: 'Domain name'}}},
	alt_name: {type: String, forms: { 'all': {type: 'string', widget: forms.widgets.text(), label: 'Alt name (optional)'}}},
	owner: {type: types.objectId, ref:'MailPostmaster', required:true, forms: { 'all': {
			type: 'string',
			choices: {},
			cssClasses: {'error': [], 'label': [], 'field': ['linked_document']},
			dataFields: {'data-model': 'mailpostmasters'},
			widget: forms.widgets.select(),
			// validators: [function (form, field, callback) {
			// 	if (field.data === 'two') {
			// 		callback('two?! are you crazy?!');
			// 	} else {
			// 		callback();
			// 	}
			// }]
			}
		}
	}
};
admin.registerModel('MailDomain', MailDomainDefinition, {list:['domain', 'owner'], sort:['owner', 'domain'], popullation: {path: 'owner', select: 'username'}, linked: ['username'], plugins: [Troop.slugify, Troop.timestamp]});

 /**
 * MailUserModel
 */
var MailUserDefinition = {
	domain: {type: types.objectId, ref:'MailDomain', required:true, forms: { 'all': {
			type: 'string',
			choices: {},
			cssClasses: {'error': [], 'label': [], 'field': ['linked_document']},
			dataFields: {'data-model': 'maildomains	'},
			widget: forms.widgets.select()
		}
	}},
	username: {type: String, set: toLower, required:true, forms: { 'all': {type: 'email', widget: forms.widgets.text(), required: true, label: 'Username'}}},
	hash: {type: String, required: true, forms: {'all': {type: 'password', widget: forms.widgets.password(), required: true, label: 'Password'}}},
	alt_name: {type: String, forms: { 'all': {type: 'string', widget: forms.widgets.text(), label: 'Alt name (optional)'}}}	
};
// admin.registerModel('MailUser', MailUserModel, {list:['name', 'domain'], sort:['domaine', 'name']});
admin.registerModel('MailUser', MailUserDefinition, {list:['domain', 'username', 'alt_name'], sort:['domain', 'username'], popullation: {path: 'domain', select: 'domain'}, linked: ['domain'], plugins: [Troop.slugify, Troop.basicAuth, Troop.timestamp]});

/**
 * MailAliasModel
 */
var MailAliasDefinition = {
	domain: {type: types.objectId, ref:'MailDomain', required:true, forms: { 'all': {
			type: 'string',
			choices: {},
			cssClasses: {'error': [], 'label': [], 'field': ['linked_document']},
			dataFields: {'data-model': 'maildomains	'},
			widget: forms.widgets.select()
		}
	}},
	name: {type: String, set: toLower, required:true, forms: { 'all': {type: 'string', widget: forms.widgets.text(), required: true, label: 'Username'}}},
	to: {type: Array, forms: { 'all': {type: 'email', widget: forms.widgets.text(), required: true, label: 'Alias of'}}}
};
admin.registerModel('MailAlias', MailAliasDefinition, {list:['name', 'domain', 'to'], sort:['domain', 'name'], popullation: {path: 'domain', select: 'name'}, plugins: [Troop.slugify, Troop.timestamp]});

// admin.registerModel('MailAlias', MailAliasModel, {list:['domain', 'name'], sort:['domain', 'name']});
