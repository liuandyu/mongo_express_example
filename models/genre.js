const Joi = require('joi');
const mongoose = require('mongoose');

function validateGenre(genre) {
	const schema = Joi.object({
		name: Joi.string().min(6).max(50).required()
	});

	return schema.validate(genre);
}

const genreSchema = new mongoose.Schema({
	name: {type: String, required: true, minlength: 6, maxlength: 50}
});

const Genre = mongoose.model('Genre', genreSchema);

module.exports = {Genre, validateGenre, genreSchema};