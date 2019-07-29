module.exports = {
    database: 'mongodb://localhost:27017/haribhari',
    port: process.env.PORT || 3000,
    secretKey: "#akshna#@hari#@bhari2019",
    facebook: {
        clientID: process.env.FACEBOOK_ID || '402261320416868',
        clientSecret: process.env.FACEBOOK_SECRET || '9e6deafaaf74611c4e905d63789cfcf1',
        profileFields: ['emails', 'displayName'],
        callbackURL: 'https://localhost/auth/facebook/callback'
    }
};