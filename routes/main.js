// external imports
const router = require('express').Router();
const stripe = require('stripe')('pk_test_6eUlykjUkKIa4viRDPGNKjwv');
const async = require('async');
// custom imports
const User = require('../models/user');
const Product = require('../models/product');
const Cart = require('../models/cart');
const passportConf = require('../config/passport');
const Checkout = require('../models/checkout');
const Contact = require('../models/contact');

/**
 * Handles the products pagination/navigation
 * @param req
 * @param res
 * @param next
 */
function paginate(req, res, next) {
    // step through products 9 times
    const perPage = 9;
    //TODO: refactor below code further
    const page = req.params.page;

    Product
        .find()
        .skip(perPage * page)
        .limit(perPage)
        .populate('category')
        .exec((err, products) => {
            if (err) return next(err);
            Product.count().exec((err, count) => {
                if (err) return next(err);
                res.render('main/home',{
                    products: products,
                    pages: count / perPage
                });
            });
        });
}

/**
 * Handles mapping between a product in the database and elastic search
 */
/*
Product.createMapping((err, mapping) => {
    //TODO: add logic to inform the user of the successful mapping
    if (err) {
        console.log("Error creating mapping");
        console.log(err);
    } else {
        console.log("Mapping created");
    }
});

let stream = Product.synchronize(), count = 0;

stream.on('data', () => {
    count++;
});
stream.on('close', () => {
    console.log("Indexed " + count + " documents from Products");
});

stream.on('error', (err) => {
    console.log(err);
});

*/
/**
 * single product search
 */
router.get('/search', (req, res, next) => {

    if (req.query.q) {
        Product.search({
            query_string: {query: req.query.q}
        }, (err, results) => {

            if (err) return next(err);
            console.log(results);
            let data = results.hits.hits.map((hit) => {
                return hit;
            });
            console.log(data);
            res.render('main/search-result', {
                query: req.query.q,
                data: data
            });
        });
    }
});

router.post('/search', (req, res, next) => {
    res.redirect('/search?q=' + req.body.q);
});

router.post('/product/:product_id', passportConf.isAuthenticated, (req, res, next) => {
    Cart.findOne({owner: req.user._id}, (err, cart) => {
	   console.log(cart);
        cart.items.push({
            item: req.body.product_id,
            price: parseFloat(req.body.priceValue),
            quantity: parseInt(req.body.quantity)
        });

        cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);

        cart.save((err) => {
            if (err) return next(err);
            return res.redirect('/cart');
        })
    });
});

router.get('/cart', passportConf.isAuthenticated, (req, res, next) => {
    Cart.findOne({owner: req.user._id})
        .populate('items.item')
        .exec((err, foundCart) => {
            if (err) return next(err);

            res.render('main/cart', {
                foundCart: foundCart,
                message: req.flash('remove')
            });
        });
});

router.post('/remove', passportConf.isAuthenticated, (req, res, next) => {
    Cart.findOne({owner: req.user._id}, (err, foundCart) => {
        foundCart.items.pull(String(req.body.item));

        foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);

        foundCart.save((err, found) => {
            if (err) return next(err);

            req.flash('remove', 'Successfully removed the product');
            res.redirect('/cart');
        });
    });
});

router.get('/', (req, res, next) => {
    if (req.user) {
        paginate(req, res, next);
    }
	else{
	  paginate(req, res, next);
	}
});

//******************************//
//my self routes
router.get('/shop',(req,res,next)=>
{
 if(req.user)
 {
 	 res.render('main/shop');
 }
 else
 {
 res.render('main/shop');
 }
});

//my self 2nd routes
router.get('/about',(req,res,next)=>
{
res.render('main/about');

});

router.get('/contact',(req,res,next)=>
{
res.render('main/contact');
});

router.post('/contact',(req,res,next)=>
{
const contact = new Contact();
console.log(req.body);

contact.yourname=req.body.yourname;
contact.email=req.body.email;
contact.contactform=req.body.contactform;
contact.message=req.body.message;

contact.save((err) => {
		// handle errors
		if (err) return next(err);
		// no errors, return success message
		req.flash('success', 'Successfully added information');
		// redirect to the add category view
		return res.redirect('/');
	})
});


//myself third routes goes here//

router.get('/portfolio',(req,res,next)=>
{
res.render("main/portfolio");
})

//myself fourth routes
router.get('/checkout',passportConf.isAuthenticated, (req, res, next) => {

	Cart.findOne({owner: req.user._id})
        .populate('items.item')
        .exec((err, foundCart) => {
            if (err) return next(err);

            res.render('main/checkout', {
                foundCart: foundCart
            });
        });
});

router.post('/checkout',(req, res, next) => {
	// create new category instance
	const checkout = new Checkout();
	console.log(req.body);
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
		return res.redirect('/checkout');
	})
});



router.get('/payment',passportConf.isAuthenticated,(req,res,next)=>
{

Cart.findOne({owner: req.user._id})
        .populate('items.item')
        .exec((err, foundCart) => {
            if (err) return next(err);
            res.render('main/payment', {
                foundCart: foundCart
            });
        });
})

//***********************************************//
router.get('/page/:page', (req, res, next) => {
    paginate(req, res, next);

});

router.get('/about', (req, res) => {
    res.render('main/about');
});

router.get('/users', (req, res) => {
    User.find({}, (err, users) => {
        res.json(users);
    })
});

// return products based on category
router.get('/products/:id', (req, res, next) => {
    Product
        .find({category: req.params.id})
        .populate('category')
        .exec((err, products) => {
            if (err) return next(err);

            res.render('main/category', {
                products: products
            });
        });
});

// find one product and return it for single product view

router.get('/product/:id', (req, res, next) => {
	 console.log(req.params.id);
	 Product.findById({_id: req.params.id}, (err, product) => {
        if (err) return next(err);
        res.render('main/product', {
            product: product
        });
    });
});

router.post('/payment', (req, res, next) => {

    let stripeToken = req.body.stripeToken;

    let currentCharges = Math.round(req.body.stripeMoney * 100);

    stripe.customers.create({
        source: stripeToken,
    }).then((customer) => {
        return stripe.charges.create({
            amount: currentCharges,
            currency: 'usd',
            customer: customer.id
        });
    }).then((charge) => {
        async.waterfall([
            (callback) => {
                Cart.findOne({owner: req.user._id}, (err, cart) => {
                    callback(err, cart);
                });
            },
            (cart, callback) => {
                User.findOne({_id: req.user._id}, (err, user) => {
                    if (user) {
                        for (let i = 0; i < cart.items.length; i++) {
                            user.history.push({
                                item: cart.items[i].item,
                                paid: cart.items[i].price
                            });
                        }
                        user.save((err, user) => {
                            if (err) return next(err);
                            callback(err, user);
                        });
                    }
                });

            },
            (user) => {
                Cart.update({owner: user._id}, {$set: {items: [], total: 0}}, (err, updated) => {
                    if (updated) {
                        res.redirect('/profile');
                    }
                });
            }]);
    });
});

module.exports = router;
