# Welcome node-opensmtpd Admin

## Goal

- Provide a GUI for the admin (create and manage postmaster accounts, assign domains to them)
- Provide a GUI for the postmasters (to create and manage mail user and aliases on their domains)
- Provide a GUI for mail users (to change their password and auto-responder, etc)
- Provide a decentralized GUI
- Integrate on any *nix platform running node-js


### Status

As of today 21/06/13, the main MVC and model structure is ready and working.
Next step, expand the "shell" utility to generate bdb style files for opensmtpd

### About Mangoose Admin "Prime edition"

This project aims to provide an admin enduser interface to mongoose models, and was originally created as an express 2.x project.

Looking for a quick way to deploy a tailored MVC for the node-opensmtpd needs, I ported it to express 3.x, with a few additions of my own:

- the ability to load more detailed models and population maps
- the ability to load schema plugins
- and more...

###  Install

```
git clone https://github.com/kelexel/node-opensmtpd.git
npm install
```

Edit etc/env.js, mainly set your mongodb host & port

Create the admin user by invoking:

```
cd bin
sh ./run.sh --shell
```

You're ready to start the server by using

```
sh ./run.sh
```


### License

#### node-opensmtpd Admin

* Copyright (c) 2013 Rudolph Sand (rudolph.sand@gmail.com)
* MIT Licensed

#### Mongoose Admin "Prime Edition"

* Copyright (c) 2013 Rudolph Sand (rudolph.sand@gmail.com)
* MIT Licensed
* Based on:
* Mongoose Admin - newleafdigital FORK
* Project URL: https://github.com/newleafdigital/mongoose-admin/tree/refactor
* Copyright ?
* MIT Licensed
* Based on:
* Mongoose Admin
* Copyright (c) 2011 Marc Campbell (marc.e.campbell@gmail.com) * Copyright (c) 2013 Rudolph Sand (rudolph.sand@gmail.com)
* MIT Licensed
