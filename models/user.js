const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

function validateUser(user) {
	const schema = Joi.object({
		name: Joi.string().min(3).required(),
		email: Joi.string().min(3).required().email(),
		password: Joi.string().min(3).required()
	});

	return schema.validate(user);
}

const userSchema = new mongoose.Schema({
	name: {
		type: String, 
		required: true,
		minlength: 5,
		maxlength: 50
	},
	email: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 50,
		unique: true
	},
	password: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 1024
	},
	isAdmin: Boolean
});

userSchema.methods.generateAuthToken = function() { //arrow function doesn't have `this`
	const token = jwt.sign({_id: this._id, isAdmin: this.isAdmin}, config.get('jwtPrivateKey'));
	return token;
}

const User = mongoose.model('User', userSchema);

module.exports = {User, validateUser};