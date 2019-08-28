const router = require('express').Router();
const checkout = require('../models/checkout');

/**
 * handles GET HTTP requests for adding a category
 */
router.get('/checkout', (req, res, next) => {
	res.render('main/checkout'), {message: req.flash('checkoutpage')}});

/**
 * Handles POST HTTP requests for adding a category
 */
router.post('/checkout', (req, res, next) => {
	// create new category instance
	const checkout = new checkout();
	// retrieve the category name from the data sent over from the client
	 checkout.firstname = req.body.firstname;
	 checkout.lastname =req.body.lastname;
	 checkout.emailAdress = req.body.emailaddress;
	 checkout.phoneNumber = req.body.phonenumber;
	 checkoutcompanyName = req.body.companyname
	 checkout.adress = req.body.address;
 	 checkout.city = req.body.city;
	 checkout.state = req.body.state;
	 checkout.postcode = req.body.postcode;
	 checkout.orderNotes = req.body.ordernotes;
	// save the category name to mongo
	checkout.save((err) => {
		// handle errors
		if (err) return next(err);
		// no errors, return success message
		req.flash('success', 'Successfully added information');
		// redirect to the add category view
		return res.redirect('/checkoout');
	})
});
// make route accessible to other files
module.exports = router;