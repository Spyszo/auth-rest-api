/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
const User = require('mongoose').model('User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const transporter = require('../config/nodemailer');

exports.activate = async (req, res) => {
  try {
    const { activationToken } = req.body;

    if (!activationToken) return res.status(400).json({ message: 'Undefined activation token' });

    const user = await User.findOne({ activationToken });

    if (!user) return res.status(400).json({ message: 'Wrong activation token' });

    if (user.activated) return res.status(200).json({ message: 'Your account is already activated' });

    user.activated = true;
    await user.save();

    return res.status(200).json({ message: 'Account activated successfully' });
  } catch (err) {
    console.log('Internal error: ', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'No account with this email' });

    const passwordResetToken = crypto.randomBytes(6).toString('hex');
    const passwordResetExpiresAt = Date.now() + 30 * 60 * 1000;

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpiresAt = passwordResetExpiresAt;
    user.passwordResetToken_used = false;
    await user.save();

    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: 'Reset password request',
      html: `<p>Our system received password reset request. Your reset token: ${passwordResetToken} + </p>`,
    };

    await transporter.sendMail(mailOptions);
    const mail = await transporter.sendMail(mailOptions);
    if (mail.accepted) {
      if (process.env.PRODUCTION) return res.status(200).json({ message: 'Password reset link has been sent to your email', passwordResetToken });
      return res.status(200).json({ message: 'Password reset link has been sent to your email' });
    }

    return res.status(500).json({ message: 'Internal server error' });
  } catch (err) {
    console.log('Internal error: ', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.verifyResetToken = async (req, res) => {
  try {
    const { passwordResetToken, email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'No account with this email' });

    if (user.passwordResetToken !== passwordResetToken) return res.status(400).json({ message: 'Wrong reset token' });

    return res.status(200).json({ message: 'Token accepted' });
  } catch (err) {
    console.log('Internal error: ', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // eslint-disable-next-line object-curly-newline
    const { newPassword, newPasswordCheck, passwordResetToken, email } = req.body;

    if (!newPassword || !newPasswordCheck || !passwordResetToken || !email) return res.status(400).json({ message: 'Not all fields have been entered' });
    if (newPassword !== newPasswordCheck) return res.status(400).json({ message: 'Enter the same password twice for verification' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Can't find user" });
    if (user.passwordResetToken !== passwordResetToken) return res.status(400).json({ message: 'Wrong reset token' });

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(newPasswordCheck, salt);
    user.password = passwordHash;
    user.password_lastChange = Date.now();
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.log('Internal error: ', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, newPasswordCheck } = req.body;

    if (!oldPassword || !newPassword || !newPasswordCheck) return res.status(400).json({ err: 'Not all fields have been entered' });
    if (newPassword !== newPasswordCheck) return res.status(400).json({ err: 'Enter the same password twice for verification' });
    if (newPasswordCheck < 5) return res.status(400).json({ err: 'The password needs to be at least 5 characters long' });

    const user = await User.findOne({ _id: req.user.user.id });
    if (!user) return res.status(400).json({ err: "Can't find user" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) return res.status(400).json({ err: 'Wrong password' });
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(newPasswordCheck, salt);
    user.password = passwordHash;
    await user.save();

    return res.status(200).json({ msg: 'Password changed successfully' });
  } catch (err) {
    console.log('Internal error: ', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
