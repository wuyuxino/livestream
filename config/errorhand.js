const log = require('./log')

exports.errorhand = async function (err, req, res, next) {
	if (err.name === 'UnauthorizedError') {
		return res.status(401).send({
			status: 401,
			data: {},
			message: 'Identity authentication failed!!!'
		});
	}
	if (err) {
		log.errorlog.error(err)
		return res.status(500).send(err.message)
	}
	next()
}