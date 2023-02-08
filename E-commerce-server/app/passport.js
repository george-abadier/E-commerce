const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const facebookStrategy = require('passport-facebook').Strategy;
passport.serializeUser(function (user, done) {
    console.log(user)
    done(null, user);
});

// used to deserialize the user
passport.deserializeUser(function (user, done) {
    console.log(user)
    done(null, user);
});
passport.use(new GoogleStrategy({
    clientID: process.env.googleClientID,
    clientSecret: process.env.googleClientSecret,
    callbackURL: "http://localhost:3000/ecommerce/user/googlelogin/callback",
    passReqToCallback: true
}, (request, accessToken, refreshToken, profile, done) => {
    console.log(profile)
    done(null, profile)
}));
passport.use(new facebookStrategy({

    // pull in our app id and secret from our auth.js file
    clientID: process.env.fbClientID,
    clientSecret: process.env.fbClientSecret,
    callbackURL: "http://localhost:3000/ecommerce/user/facebooklogin/callback",
    profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)', 'email']

},// facebook will send back the token and profile
    function (token, refreshToken, profile, done) {

        console.log(profile)
        return done(null, profile)
    }));