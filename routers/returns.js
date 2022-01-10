const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const {Rental, validateRental} = require('../models/rental');
const {Movie} = require('../models/movie');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const moment = require('moment');
const Joi = require('joi');

router.post('/', [auth], async (req, res) => {
	
	const {error} = validateReturn(req.body);
	if (error)
		return res.status(400).send(error.details[0].message);
	

	if(!req.body.customerId) {
		return res.status(400).send('customer id is not provided.')
	}

	if(!req.body.movieId) {
		return res.status(400).send('movie id is not provided.')
	}

	const rental = await Rental.findOne({'customer._id': req.body.customerId, 'movie._id': req.body.movieId});

	if(!rental){
		return res.status(404).send('No rental record found.');
	}

	if(rental.dateReturned)
		return res.status(400).send('Return already processed.')

	rental.dateReturned = new Date();
	rental.rentalFee = moment().diff(rental.dateOut, 'days') * rental.movie.dailyRentalRate;
	await Movie.update({ _id: rental.movie._id}, {
		$inc: {numberInStock: 1}
	});

	await rental.save();

	return res.status(200).send(rental);
});

function validateReturn(res) {
	const schema = Joi.object({
		customerId: Joi.string().min(1).required(),
		movieId: Joi.string().min(1).required()
	});

	return schema.validate(res);
}

module.exports = router;