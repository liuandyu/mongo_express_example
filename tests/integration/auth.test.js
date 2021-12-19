const request = require('supertest');
const {User} = require('../../models/user');
const {Genre} = require('../../models/genre');
let server ;

describe('auth middleware', () => {
	beforeEach(() => {
		server = require('../../index');
	});

	afterEach( async () => {
		await Genre.remove({});
		server.close();
	});

	test('should return 401 if no token is provided', async () => {
		//const token = new User().generateAuthToken();
		const token = '';
		const res = await request(server).post('/api/genres')
			.set('x-auth-token', token)
			.send({name: 'genere1'});
		expect(res.status).toBe(401);
	})

	test('should return 400 if token is invalid', async () => {
		//const token = new User().generateAuthToken();
		const token = 'a';
		const res = await request(server).post('/api/genres')
			.set('x-auth-token', token)
			.send({name: 'genere1'});
		expect(res.status).toBe(400);
	})

	test('should return 200 if token is valid', async () => {
		const token = new User().generateAuthToken();
		//const token = 'a';
		const res = await request(server).post('/api/genres')
			.set('x-auth-token', token)
			.send({name: 'genere1'});
		expect(res.status).toBe(200);
	})
});