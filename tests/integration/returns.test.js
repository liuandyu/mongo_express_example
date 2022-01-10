const request = require('supertest');
const {Rental} = require('../../models/rental');
const {Movie} = require('../../models/movie');
const {User} = require('../../models/user');
const mongoose = require('mongoose');
const moment = require('moment'); // function


describe('/api/returns', () => {
	let server;
	let customerId;
	let movieId;
	let rental;
	let token;
	let movie;
	
	const exec = async () => {
		return await request(server)
			.post('/api/returns')
			.set('x-auth-token', token)
			.send({movieId, customerId});
	};

	beforeEach(async () => {
		server = require('../../index');

		customerId = mongoose.Types.ObjectId();
		movieId = mongoose.Types.ObjectId();
		token = new User().generateAuthToken();

		movie = new Movie({
			_id: movieId,
			title: '12345',
			dailyRentalRate: 2,
			genre: {name: '1234578'},
			numberInStock: 10
		});
		await movie.save();

	    rental = new Rental({
			customer: {
				name: '12345',
				phone: '12345',
				_id: customerId
			},
			movie: {
				_id: movieId,
				title: '12345',
				dailyRentalRate: 2
			}
		});
		await rental.save();
	});

	afterEach( async () => {
		await Rental.remove({});
		await Movie.remove({});
		await server.close();
	});

	test('should return 401 if client is not logged in!', async () => {
		token = '';
		const res = await exec();

		expect(res.status).toBe(401);
	});

	test('should return 400 if customerId is invalid', async () => {
		//const token = new User().generateAuthToken();
		customerId = '';
		const res = await exec();

		expect(res.status).toBe(400);
	});

	test('should return 400 if customerId is invalid', async () => {
		movieId = '';
		const res = await exec();
		expect(res.status).toBe(400);
	});

	test('should return 404 if no rental found for this customer/movie', async () => {
		//const rental = await Rental.find({customerId: customerId});
		//expect(rental).toBeNull();
		await Rental.remove({});

		const res = await exec();
		expect(res.status).toBe(404);
	});

	test('should return 400 if rental already processed', async () => {
		//const rental = await Rental.find({customerId: customerId});
		//expect(rental).toBeNull();
		rental.dateReturned = new Date();
		await rental.save();
		
		const res = await exec();
		expect(res.status).toBe(400);
	});

	test('should return 200 if valid request', async () => {
		const res = await exec();
		expect(res.status).toBe(200);
	});

	test('should set the returnDate if input is valid', async () => {
		const res = await exec();

		const rentalInDb = await Rental.findById(rental._id);

		const diff = new Date()- rentalInDb.dateReturned;
		expect(diff).toBeLessThan(10*1000);

		//expect(rentalInDb.dateReturned).toBeDefined();
	});

	test('should calculate the rental fee if input is valid', async () => {

		rental.dateOut = moment().add(-7, 'days').toDate();
		await rental.save();

		const res = await exec();

		const rentalInDb = await Rental.findById(rental._id);
		expect(rentalInDb.rentalFee).toBe(14);
	});

	test('should increase the stock if input is valid', async () => {

		rental.dateOut = moment().add(-7, 'days').toDate();
		await rental.save();

		const res = await exec();

		//const rentalInDb = await Rental.findById(rental._id);
		const movieInDb = await Movie.findById({_id: movieId});
		expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
	});

	test('should return the rental if input is valid', async () => {
		const res = await exec();
		const rentalInDb = await Rental.findById(rental._id);
		expect(res.body).toHaveProperty('dateOut');
		expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['dateOut', 'dateReturned', 'rentalFee', 'customer', 'movie']));
	});
});