const bcrypt = require('bcrypt');


//this is an example for Promise 
async function run() {
	const salt = await bcrypt.genSalt(10); //return a Promise we can put this await promise inside async function

	const hashed = await bcrypt.hash('1234', salt); 
	
   console.log(hashed)
}


run();
