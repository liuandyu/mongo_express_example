const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const {Rental, validateRental} = require('../models/rental');
const {Movie} = require('../models/movie');
const {Customer} = require('../models/customer');
const Fawn = require('fawn');// Fawn is class

//Fawn.init(mongoose);

router.get('/', async (req, res) => {
	const rentals = await Rental.find().sort('-dateOut');
	res.send(rentals);
});

router.post('/', async (req, res) => {
	const {error}  = validateRental(req.body);
	if(error)
		return res.status(400).send(error.details[0].message);

	if(!mongoose.Types.ObjectId.isValid(req.body.customerId))
		return res.status(400).send('Invalid customer.');
	if(!mongoose.Types.ObjectId.isValid(req.body.movieId))
		return res.status(400).send('Invalid Movie.');

	//it's valid customer object
	const customer = await Customer.findById(req.body.customerId);
	if(!customer)
		return res.status(400).send('Invalid customer.');

	//it's valid movie object
	const movie = await Movie.findById(req.body.movieId);
	if(!movie)
		return res.status(400).send('Invalid movie.');


	if (movie.numberInStock === 0) 
		return res.status(400).send('Movie is out of stock.');

	//console.log('customer:', customer);
	//console.log('movie:', movie)
	//return;

	let rental = new Rental({
		customer: {
			_id: customer._id,
			name: customer.name,
			phone: customer.phone
		},
		movie: {
			_id: movie._id,
			title: movie.title,
			numberInStock: movie.numberInStock,
			dailyRentalRate: movie.dailyRentalRate
		}
	});

	rental = await rental.save();

	movie.numberInStock--; //Perform Two Phase Commits
	movie.save();

/*
	try{
		new Fawn.Task()
		   .save('rentals', rental)
		   .update('movies', { _id: movie._id}, {
		   	$inc: { numberInStock: -1}
		   })
		   .run();
	} catch(ex) {
		res.status(500).send('Something failed.');
	}
*/

	res.send(rental);
});

module.exports = router;