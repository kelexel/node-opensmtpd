/** 
 * Module dependencies
 */
var sys = require('util'),
	mongoose = require('mongoose'),
	prime = require('prime')

var MongooseAdminAudit = prime({
	constructor: function() {
		this.fields = {};
	},

	/**
	 * Records a single audited activity
	 *
	 * @param {Object} user
	 * @param {String} adminModelName
	 * @param {String} collectionName
	 * @param {String} documentId
	 * @param {String} action
	 * @param {String} note
	 *
	 * @api private
	 */
	logActivity: function(user, adminModelName, collectionName, documentId, action, note, onReady) {
		var auditLog = new MongooseAdminAudit();
		var auditLogModel = mongoose.model('_MongooseAdminAudit');
	
		auditLogData = new auditLogModel();
		console.log(user)
		auditLogData.user = user.fields._id;
		auditLogData.adminModelName = adminModelName;
		auditLogData.collectionName = collectionName;
		auditLogData.documentId = documentId;
		auditLogData.action = action;
		auditLogData.note = note;
	
		auditLogData.save(function(err) {
			if (err) {
				console.log('Unable to store item in audit log because: ' + err);
				onReady('Unable to store item in log', null);
			} else {
				auditLog.fields = auditLogData;
				onReady(null, auditLog);
			}
		});
	}
});
module.exports = MongooseAdminAudit;
