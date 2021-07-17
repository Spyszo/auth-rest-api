const router = require('express').Router();
const passport = require('passport');
const AuthController = require('../controllers/AuthController');
const verifyJWT = require('../helpers/verifyJWT');

router.post('/register', AuthController.register);

router.post('/login', AuthController.login);

router.post('/verify', AuthController.verify);

router.post('/delete', verifyJWT, AuthController.delete);

router.post('/logout', verifyJWT, AuthController.logout);

router.get('/connect/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/connect/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://example.pl?loginFailed' }),
  (req, res) => {
    res.redirect(`http://example.pl:3000?token=${req.user.token}`);
  });

router.get('/connect/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/connect/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/fail' }),
  (req, res) => {
    res.redirect(`http://example.pl:3000?token=${req.user.token}`);
  });

module.exports = router;
