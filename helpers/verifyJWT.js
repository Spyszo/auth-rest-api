/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
const User = require('mongoose').model('User');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const pathToPubKey = path.join(__dirname, '..', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToPubKey, 'utf8');

// eslint-disable-next-line consistent-return
const verifyJWT = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) return res.json({ authenticated: false });

    const jwtPayload = jwt.verify(accessToken, PUB_KEY, ['RS256']);

    const user = await User.findOne({ _id: jwtPayload.sub });
    if (!user) return res.json({ authenticated: false });

    const newAccessToken = user.issueJWT();

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      path: '/',
    });

    next();
  } catch (err) {
    console.log('Internal error: ', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = verifyJWT;
