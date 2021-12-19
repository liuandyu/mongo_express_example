const Joi = require('joi');
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
	name: {type: String, required: true},
	isGold: {type: Boolean, default: false},
	phone: {type: String, required: true},
	
});

function validateCustomer(customer) {
	const schema = Joi.object({
		name: Joi.string().min(3).required(),
		phone: Joi.string().min(6).required(),
		isGold: Joi.required()
	});

	return schema.validate(customer);
}

const Customer = mongoose.model('Customer', customerSchema);

module.exports = {Customer, validateCustomer, customerSchema};

//sudo docker images
//sudo docker run -d -p 27017:27017 images_id
//socker start continer_id to resume the stopping container.