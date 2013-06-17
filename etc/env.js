	if (process.env.NODE_ENV == 'dev') {
		module.exports = {
			'redisPort': 8988,
			'sessionKey': 'HelloWorld',
			'logLevel': 'debug',
			'listenPort': 8888,
			'mongoIP': '172.16.76.130',
			'mongoPort': '27017',
			'mongoDB': 'maildb',
			'url_cdn': 'http://localhost:8888/assets/js',
			'url_socketio': 'http://localhost:8888'
		};
	} else {
		module.exports = {
			'redisPort': 8988,
			'sessionKey': 'HelloWorld',
			'logLevel': 'info',
			'listenPort': 8888,
			'mongoIP': '172.16.76.130',
			'mongoPort': '27017',
			'mongoDB': 'maildb',
			'url_cdn': 'http://foo.ext:8888/assets/js',
			'url_socketio': 'http://foo.ext:8888'
		}
	}
