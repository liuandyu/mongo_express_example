require('express-async-errors');
const winston = require('winston');
require('winston-mongodb');
const mongoose = require('mongoose');
const customers = require('./routers/customers');
const genres = require('./routers/genres');
const movies = require('./routers/movies');
const rentals = require('./routers/rentals');
const returns = require('./routers/returns');
const users = require('./routers/users');
const auth = require('./routers/auth');
const express = require('express');
const app = express();
const config = require('config');
const error = require('./middleware/error');

process.on('uncaughtException', (ex) => {
	console.log('WE GOT AN UNCAUGHT EXCEPTION');
	winston.error(ex.message);
	process.exit(1);
});

process.on('unhandledException', (ex) => {
	console.log('WE GOT unhandledException');
	winston.log('error', ex.message);
	process.exit(1);
})

winston.add(new winston.transports.File({filename: 'logfile.log'}));

//winston.add(new winston.transports.MongoDB({db: 'mongodb://localhost:27017/customer'}));

if(!config.get('jwtPrivateKey')) {
	//export jyu_jwtPrivateKey=mySecretKey  --> make set up env value
	console.log('FATAL ERROR: jwtPrivateKey is not defined');
	process.exit(1);
}

mongoose.connect(config.get('db'), {useNewUrlParser: true,useUnifiedTopology: true})  //mongoose is a Promise object
.then(()=> console.log(`connected to ${config.get('db')} ...`))
.catch(err => console.log(`Could not connect o Mongo DB`, err));

app.use(express.json());
app.use('/api/customers', customers);
app.use('/api/genres', genres);
app.use('/api/movies', movies);
app.use('/api/rentals', rentals);
app.use('/api/returns', returns);
app.use('/api/users', users);
app.use('/api/auth', auth);

app.use(error);
/*
app.use(function(err, req, res, next) {
	//single place handle all API exception.
	res.status(500).send('Something failed.');
});
*/

const port = process.env.PORT || 3000;
const server = app.listen(port, ()=> console.log(`Listening on port ${port}...`));

module.exports = server;

