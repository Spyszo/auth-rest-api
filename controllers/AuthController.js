/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
const User = require('mongoose').model('User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const randtoken = require('rand-token');
const fs = require('fs');
const path = require('path');
const transporter = require('../config/nodemailer');

const pathToPubKey = path.join(__dirname, '..', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToPubKey, 'utf8');

function emailIsValid(email) {
  return /\S+@\S+\.\S+/.test(email);
}

exports.verify = async (req, res) => {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) return res.json({ authenticated: false });

    const jwtPayload = jwt.verify(accessToken, PUB_KEY, ['RS256']);

    const user = await User.findOne({ _id: jwtPayload.sub });
    if (!user) return res.json({ authenticated: false });

    const newAccessToken = user.issueJWT();

    const data = {
      id: user._id,
      displayName: user.displayName,
      accessToken: newAccessToken,
    };

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      path: '/',
    });

    return res.status(200).json({ message: 'Welcome back!', user: data });
  } catch (err) {
    console.log('Internal error: ', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Not all fields have been entered' });
    }

    const user = await User.findOne({ email });
    if (!user) { return res.status(400).json({ message: 'Wrong email or password' }); }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Wrong email or password' });

    if (!user.activated) {
      return res
        .status(400)
        .json({ message: 'Account is not activated. Check your email' });
    }

    const refreshToken = randtoken.uid(256);
    const refreshTokenExpiresAt = Date.now() + 1000 * 60 * 60 * 24 * 3; // 3 days

    const accessToken = user.issueJWT();

    const data = {
      displayName: user.displayName,
      id: user._id,
      accessToken,
    };

    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = refreshTokenExpiresAt;

    await user.save();

    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        path: '/',
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        path: '/',
      });

    return res
      .status(200)
      .json({ message: 'Logged in successfully', user: data });
  } catch (err) {
    console.log('Internal error: ', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.register = async (req, res) => {
  try {
    const {
      email, password, passwordCheck, displayName,
    } = req.body;

    // validate
    if (!email || !password || !passwordCheck || !displayName) {
      return res
        .status(400)
        .json({ message: 'Not all fields have been entered' });
    }
    if (password.length < 5) {
      return res.status(400).json({
        message: 'The password needs to be at least 5 characters long',
      });
    }
    if (password !== passwordCheck) {
      return res
        .status(400)
        .json({ message: 'Enter the same password twice for verification' });
    }

    if (!emailIsValid(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(passwordCheck, salt);

    const activationToken = crypto.randomBytes(20).toString('hex');

    const newUser = new User({
      email,
      password: passwordHash,
      displayName,
      activated: false,
      activationToken,
    });

    await newUser.save();

    let activationLink = `://${process.env.HOST}:${process.env.PORT}/activate/?token=${activationToken}`;

    if (process.env.SSL) {
      activationLink = `https${activationLink}`;
    } else {
      activationLink = `http${activationLink}`;
    }

    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: 'Activate you account',
      html: `<p>Click link below to activate your accout: <br><br> 
                    <a href="${activationLink}">${activationLink}</a> <br><br> 
                    You have 2 hours to activate your account.
                 </p>`,
    };

    const mail = await transporter.sendMail(mailOptions);
    if (mail.accepted) {
      if (process.env.PRODUCTION) {
        return res.status(201).json({
          token: activationToken,
          message:
            'Register successful. Check your email to activate your account',
        });
      }

      return res.status(201).json({
        message:
          'Register successful. Check your email to activate your account',
      });
    }
    console.log('Mail problem or Register error after function findONe');
    return res.status(500).json({ message: 'Internal server error' });
  } catch (err) {
    console.log('Internal error: ', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.logout = async (req, res) => {
  res.cookie('accessToken', '').cookie('refreshToken', '');

  return res.status(200).json({ message: 'Logged out!' });
};

exports.delete = async (req, res) => {
  const { email } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    await existingUser.remove();
    return res.status(200).json({ message: 'Deleted successfully' });
  }
  return res.status(404).json({ message: 'User not found' });
};
