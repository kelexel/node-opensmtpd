	if (process.env.NODE_ENV == 'dev') {
		module.exports = {
			'logLevel': 'debug',
			'adminIP': "*",
			'adminPort': 8888,
			'adminUrl': 'http://localhost:8888',
			'adminSessionKey': '1234567890QWERTY',
			'mongoIP': '172.16.76.130',
			'mongoPort': '27017',
			'mongoDB': 'maildb'
		};
	} else {
		module.exports = {
			'logLevel': 'info',
			'adminIP': "*",
			'adminPort': 8888,
			'adminSessionKey': '1234567890QWERTY',
			'mongoIP': '172.16.76.130',
			'mongoPort': '27017',
			'mongoDB': 'maildb',
			'url': 'http://localhost:8888'
		}
	}
