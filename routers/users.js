const _ = require('lodash'); //
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const {User, validateUser} = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/auth');

router.get('/me', auth, async (req, res) => {
	const user = await User.findById(req.user._id).select('-password');
	res.send(user);
});

router.post('/', async (req, res) => {
	const {error}  = validateUser(req.body);
	if(error)
		return res.status(400).send(error.details[0].message);

	let user = await User.findOne({ email: req.body.email });

	if(user)
		return res.status(400).send('User already registered.');
/*
	user = new User({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password
	});
*/
	user = new User(_.pick(req.body, ['name', 'email', 'password']));

	const salt = await bcrypt.genSalt(10); //return a Promise we can put this await promise inside async function
	user.password = await bcrypt.hash(user.password, salt); 

	user = await user.save();

	//const token = jwt.sign({_id: user._id}, config.get('jwtPrivateKey'));
	const token = user.generateAuthToken();
	res.header('x-auth-token', token)
	   .send(_.pick(user, ['_id', 'name', 'email']));
});

module.exports = router;
