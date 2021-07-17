/* eslint-disable func-names */
const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');

const fs = require('fs');
const path = require('path');

const pathToPrivKey = path.join(__dirname, '..', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToPrivKey, 'utf8');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  displayName: { type: String, required: true },
  activated: { type: Boolean, required: true, default: false },
  activationToken: { type: String },
  refreshToken: { type: String },
  refreshTokenExpires: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: String },
  passwordResetTokenUsed: { type: Boolean },
  passwordLastChange: { type: String },
});

userSchema.methods.issueJWT = function () {
  const payload = {
    sub: this.id,
    iat: Date.now(),
  };

  return jwt.sign(payload, PRIV_KEY, { expiresIn: '7d', algorithm: 'RS256' });
};

mongoose.model('User', userSchema);
