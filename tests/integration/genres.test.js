const request = require('supertest');
const {Genre} = require('../../models/genre');
const {User} = require('../../models/user');
const mongoose = require('mongoose');
let server ;

describe('/api/genres', () => {
	beforeEach(() => {
		server = require('../../index');
	});
	afterEach( async () => {
		await Genre.remove({});
		await server.close(); //return a promise object
		
	});

	describe('GET /', () => {
		test('should return all genres', async () => {
			await Genre.collection.insertMany([
				{name: 'genre1'},
				{name: 'genre2'}
			]);
			
			const res = await request(server).get('/api/genres');
			expect(res.status).toBe(200);
			expect(res.body.length).toBe(2);
			expect(res.body.some( g => g.name === 'genre1')).toBeTruthy()
			expect(res.body.some( g => g.name === 'genre2')).toBeTruthy()
		})
	});

	describe('GET /:id',  () => {
		test('should return a genre if valid id is passed', async () => {
			const genre = new Genre({name: 'genre1'});
			await genre.save();

			const res = await request(server).get('/api/genres/' + genre._id);

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty('name', genre.name);
		});

		test('should return 404 if invalid id is passed', async () => {
			const res = await request(server).get('/api/genres/1');

			expect(res.status).toBe(404);
		});

		test('should return 404 if valid id is passed', async () => {
			let id = mongoose.Types.ObjectId();
			const res = await request(server).get('/api/genres/' + id);

			expect(res.status).toBe(404);
		});
	});
	
	describe('POST /',  () => {
		let token;
		let name;

		const exec = async () => {
			return await request(server)
				.post('/api/genres')
				.set('x-auth-token', token)
				.send({name});
		}

		//before testing, setting global parameters' values.
		beforeEach(() => {
			token = new User().generateAuthToken();
			name = 'genre1';
		})

		test('should return 401 if client is not logged in',  async () => {
			token = '';
			const res = await exec()
			expect(res.status).toBe(401);
		});
		
		test('should return 401 if genre is less than 5 charaters',  async () => {
			name = '1234';
			const res = await exec();

			expect(res.status).toBe(400);
		});

		test('should return 401 if genre is less than 50 charaters',  async () => {
			name = new Array(52).join('a');
			const res = await exec();

			expect(res.status).toBe(400);
		});

		test('should save the genre if it is valid',  async () => {
			const res = await exec();
			const genre = await Genre.find({name: 'genre1'});
			
			expect(res.status).toBe(200);
			expect(genre[0]).not.toBeNull();
			expect(genre[0]).toMatchObject({name:'genre1'});
			expect(genre[0]).toHaveProperty('name', 'genre1');
		});

		test('should return the genre if it is valid',  async () => {
			//const token = new User().generateAuthToken();
			//const n = new Array(52).join('a');
			const res = await exec();
			expect(res.status).toBe(200);
			expect(res.body).toMatchObject({name:'genre1'});
			expect(res.body).toHaveProperty('name', 'genre1');
			expect(res.body).toHaveProperty('_id');
		});
	});

	describe('DELETE /:id',  () => {
		test('should return 401 if no token passed in', async () => {
			const genre = new Genre({name: 'genre1'});
			await genre.save();
			const id = genre._id;

			const res = await request(server).delete('/api/genres/' + id).send();//return a promise
			expect(res.status).toBe(401);
		});

		test('should return 403 if the user is not an admin', async () => {
			const genre = new Genre({name: 'gener1'});
			await genre.save();
			const id = genre._id;

			const token = new User({}).generateAuthToken();

			const res = await request(server).delete('/api/genres/'+id).set('x-auth-token', token).send();

			expect(res.status).toBe(403);
		});

		test('should return 404 if id is invalid', async () => {
			const id = 1;
			const token = new User({isAdmin: true}).generateAuthToken();
			const res = await request(server).delete('/api/genres/1').set('x-auth-token', token).send();

			expect(res.status).toBe(404);
		});

		test('should return 200 if input is valid', async () => {
			const genre = new Genre({name: 'gener1'});
			await genre.save();
			const id = genre._id;

			const token = new User({isAdmin: true}).generateAuthToken();
			const res = await request(server).delete('/api/genres/'+id).set('x-auth-token', token).send();

			expect(res.status).toBe(200);
		});

		test('should return genre if input is valid', async () => {
			const genre = new Genre({name: 'gener1'});
			await genre.save();
			const id = genre._id;

			const token = new User({isAdmin: true}).generateAuthToken();
			const res = await request(server).delete('/api/genres/'+id).set('x-auth-token', token).send();

			expect(res.body).toHaveProperty('_id');
			expect(res.body).toHaveProperty('name', genre.name);
		});
	});
});