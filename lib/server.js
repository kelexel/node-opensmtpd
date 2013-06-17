var prime = require('prime')
, type = require('prime/type')
// , emitter = new (require('prime/emitter'))
, cookie = require('cookie')
, connect = require('connect')
, emitter = new(require('prime/emitter'));
		var ioSession = require('socket.io-session');

global._emitter = emitter;

module.exports = prime({
	_arena: false,			// holds the arena object
	_playerNames: [],		// ?? not used yet
	_bound: {},				// holds memoized events
	constructor: function(io, server) {
		// instantiate the arena object
		this._arena = new (require(__dirname+'/arena.js'));
		// bin the removeBonus event to a socket io event inside this._arena
		this._bound.eventSocketRemoveBonus = this._arena.removeBonus.bind(this._arena, io);
		_emitter.on('arena.removeBonus', this._bound.eventSocketRemoveBonus);

		// set a namespace
		var namespace = '/arena';
		logger.debug('Configuring io namespace:', namespace)
		io.of(namespace)
		.on('connection', this.socketOnConnect.bind(this, io))
		.on('disconnect', this.socketOnDisconnect.bind(this, io));
	},
	// when a new user connects..
	socketOnConnect: function(io, socket, session) {

		// set a unique salt
		socket._salt = Math.ceil(Math.random()*100000);
		// set the player name (passed when connecting to the server)
		socket._playerName = (socket.handshake.query.name ? socket.handshake.query.name : false);
		// create a unique playerId
		socket._playerId = this._arena.makePlayerId(socket);
		// notify the arena to create a new player using the current player's socket
		this._arena.newPlayer(io, socket);
		// bind the insertCoin listener to the current player's socket
		this._bound.eventSocketInsertCoin = this._arena.insertCoin.bind(this._arena, io, socket);
		socket.on('insertCoin', this._bound.eventSocketInsertCoin);
		// bind the move listener to the current player's socket
		this._bound.eventSocketMove = this._arena.movePlayer.bind(this._arena, io, socket);
		socket.on('move', this._bound.eventSocketMove);

	 },
	 // when a user disconnects
	socketOnDisconnect: function(io, err, socket, session) {
		logger.info('-- player !!!!')
		this._arena.removePlayer(socket);
		logger.info('-- player !!!!', ok)
	}
});