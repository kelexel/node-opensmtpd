var rbac = require('mongoose-rbac')
  , Permission = rbac.Permission
  , Role = rbac.Role
  , permissions;

permissions = [
    { subject: 'MailDomain', action: 'create' }
  , { subject: 'MailDomain', action: 'read' }
  , { subject: 'MailDomain', action: 'update' }
  , { subject: 'MailDomain', action: 'delete' }
  , { subject: 'Comment', action: 'create' }
  , { subject: 'Comment', action: 'read' }
  , { subject: 'Comment', action: 'update' }
  , { subject: 'Comment', action: 'delete' }
  , { subject: 'Preference', action: 'create' }
  , { subject: 'Preference', action: 'read' }
  , { subject: 'Preference', action: 'update' }
  , { subject: 'Preference', action: 'delete' }
];

Permission.create(permissions, function (err) {
  var perms, admin, developer, readonly;

  perms = Array.prototype.slice.call(arguments, 1);

  admin = new Role({ name: 'admin' });
  admin.permissions = perms;
  admin.save(function (err, admin) {
    developer = new Role({ name: 'developer' });
    developer.permissions = perms.slice(0, 7);
    developer.save(function (err, developer) {
      readonly = new Role({ name: 'readonly' });
      readonly.permissions = [perms[1], perms[5], perms[9]];
      readonly.save(function (err, readonly) {
        // ...
      });
    });
  });
});
