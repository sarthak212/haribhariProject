const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactSchema= new Schema({
		yourName:{type:String,index:true},
		email:{type:String},
		contactform:{type:String },
		message:{type:String}
	});

module.exports = mongoose.model('Contact', ContactSchema);
