const jwt = require('jsonwebtoken');
const config = require('config');

//401 Unauthorized
//403 Forbidden
//404 not found
function admin(req, res, next) {
	if(!req.user.isAdmin) 
		return res.status(403).send('Forbidden');

	next();
}

module.exports = admin;
