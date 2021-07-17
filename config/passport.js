/* eslint-disable no-underscore-dangle */
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('mongoose').model('User');
const jwt = require('jsonwebtoken');

const fs = require('fs');
const path = require('path');

const pathToPrivKey = path.join(__dirname, '..', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToPrivKey, 'utf8');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id, done) => {
  done(null, false);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENTID,
  clientSecret: process.env.GOOGLE_CLIENTSECRET,
  callbackURL: '/google/callback',
},
((accessToken, refreshToken, profile, done) => {
  User.findOne({ email: profile.emails[0].value }, async (err, user) => {
    if (user) {
      const payload = {
        sub: user.id,
        iat: Date.now(),
      };
      const signedToken = jwt.sign(payload, PRIV_KEY, { expiresIn: '7d', algorithm: 'RS256' });
      return done(null, { token: signedToken });
    }
    const newUser = new User({
      email: profile.emails[0].value,
      password: 'google',
      displayName: profile.displayName,
    });

    await newUser.save();
    const payload = {
      sub: newUser.id,
      iat: Date.now(),
    };
    const signedToken = jwt.sign(payload, PRIV_KEY, { expiresIn: '7d', algorithm: 'RS256' });
    return done(null, { token: signedToken });
  });
})));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENTID,
  clientSecret: process.env.FACEBOOK_CLIENTSECRET,
  callbackURL: '/facebook/callback',
  profileFields: ['id', 'emails', 'displayName'],
},
((accessToken, refreshToken, profile, done) => {
  User.findOne({ email: profile.emails[0].value }, async (err, user) => {
    if (user) {
      const payload = {
        sub: user.id,
        iat: Date.now(),
      };
      const signedToken = jwt.sign(payload, PRIV_KEY, { expiresIn: '7d', algorithm: 'RS256' });
      return done(null, { token: signedToken });
    }
    const newUser = new User({
      email: profile.emails[0].value,
      password: 'facebook',
      displayName: profile.displayName,
    });

    await newUser.save();
    const payload = {
      sub: newUser.id,
      iat: Date.now(),
    };
    const signedToken = jwt.sign(payload, PRIV_KEY, { expiresIn: '7d', algorithm: 'RS256' });
    return done(null, { token: signedToken });
  });
})));
