const jwt = require('jsonwebtoken');
const config = require('config');

function auth(req, res, next) {
	const token = req.header('x-auth-token');
	if(!token)
		return res.status(401).send('Access denied. No token privide')
	try {
		const decoded = jwt.verify(token,config.get('jwtPrivateKey'));//get payload.
		req.user = decoded;
		next();
	}
	catch(ex) {
		res.status(400).send('Invalid Token.');
	}
}

module.exports = auth;


//https://www.youtube.com/embed/JTNld8Y7x2k