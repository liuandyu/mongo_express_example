const Joi = require('joi');
const mongoose = require('mongoose');
const {movieSchema} = require('./movie');
const {customerSchema} = require('./customer');


const Rental = mongoose.model('Rental', new mongoose.Schema({
	movie: {
		type: new mongoose.Schema({
			title: {
				type: String,
				required: true,
				trim: true,
				minlength: 5,
				maxlength: 255
			},
			dailyRentalRate :{
				type: Number,
				required: true,
				min: 0
			},
			numberInStock: {
				type: Number,
				required: true,
				min: 0,
				max: 255
			},
			dailyRentalRate: {
				type: Number,
				required: true,
				min: 0,
				max: 255
			}
		}),
		required: true
	},
	customer: {
		type: new mongoose.Schema({
			name: {
				type: String,
				required: true,
				minlength: 5,
				maxlength: 50
			},
			isGold: {
				type: Boolean,
				default: false
			},
			phone: {
				type: String,
				required: true,
				minlength: 5,
				maxlength: 50
			}
		}),
		required: true
	},
	dateOut: {
		type: Date,
		required: true,
		default: Date.now
	},
	dateReturned: {
		type: Date
	},
	rentalFee: {
		type: Number,
		min:0
	}
}));

function validateRental(rental) {
	const schema = Joi.object({
		movieId: Joi.string().required(),
		customerId: Joi.string().required()
	});

	return schema.validate(rental);
}

module.exports = {Rental, validateRental};