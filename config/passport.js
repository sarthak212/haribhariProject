// needed for local authentication
const passport = require('passport');
// needed for local login
const LocalStrategy = require('passport-local').Strategy;
// needed for facebook authentication
const FacebookStrategy = require('passport-facebook').Strategy;
const secret = require('../config/secret');
const User = require('../models/user');
const async = require('async');
const Cart = require('../models/cart');

// serialize and deserialize
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

// give the middleware a name, and create a new anonymous instance of LocalStrategy
passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: false
}, async (email, password, done) => {
    try {
        // 1) Check if the email already exists
        const user = await User.findOne({ 'email': email });
        if (!user) {
            return done(null, false, { message: 'Unknown User' });
        }

        // 2) Check if the password is correct
      //  const isValid = await User.comparePasswords(password, user.password);
        if(!user.comparePassword(password))
        {
            return done(null,false,{ message : 'Unknown Password'});
        }
        // 3) Check is the account is been Verified
        if(!user.active){

            return done(null,false,{message:'You need to verify email first'});
        }

        if (user.comparePassword(password)) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Unknown Password' });
        }
    } catch(error) {
        return done(error, false);
    }
}));

passport.use(new FacebookStrategy(secret.facebook, (token, refreshToken, profile, done) => {

    User.findOne({facebook: profile.id}, (err, user) => {
        if (err) return next(err);

        if (user) {
            return done(null, user);
        } else {
            async.waterfall([
                (callback) => {
                    const newUser = new User();
                    newUser.email = profile._json.email;
                    newUser.facebook = profile.id;
                    newUser.tokens.push({kind: 'facebook', token: token});
                    newUser.profile.name = profile.displayName;
                    newUser.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';

                    newUser.save((err) => {
                        if (err) return next(err);
                        callback(err, newUser._id);
                    })
                },
                (newUser) => {
                    const cart = new Cart();

                    cart.owner = newUser._id;
                    cart.save((err) => {
                        if (err) return done(err);
                        return done(err, newUser);
                    });
                }
            ]);

        }
    });
}));


// custom function validate
exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};
