const router = require('express').Router();
const AccountController = require('../controllers/AccountController');
const verifyJWT = require('../helpers/verifyJWT');

router.post('/activateAccount', AccountController.activate);

router.post('/forgotPassword', AccountController.forgotPassword);

router.post('/verifyResetToken', AccountController.verifyResetToken);

router.post('/resetPassword', AccountController.resetPassword);

router.post('/changePassword', verifyJWT, AccountController.changePassword);

module.exports = router;
