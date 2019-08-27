const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CheckoutSchema= new Schema({
		firstname:{type:String,index:true},
		lastname:{type:String},
		emailAdress:{type:String },
		phoneNumber:{type:Number},
		companyName:{type:String},
		adress:{type:String},
		city:{type:String},
		state:{type:String},
		postcode:{type:Number},
		orderNotes:{type:String},
	});

module.exports = mongoose.model('Checkout', CheckoutSchema);
