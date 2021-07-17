/* eslint-disable no-undef */
const supertest = require('supertest');

const request = supertest('http://localhost:3000');

let activationToken = 'empty!';
let cookies = 'empty!';
let passwordResetToken = 'empty!';

describe('register()', () => {
  it('Short password', (done) => {
    request.post('/api/auth/register')
      .set('Accept', 'application/json')
      .send({
        email: 'test@test.test',
        displayName: 'test',
        password: '1234',
        passwordCheck: '1234',
      })
      .end((err, res) => {
        expect(res.body.message).toBe('The password needs to be at least 5 characters long');
        expect(res.statusCode).toBe(400);
        done();
      });
  });

  it('Wrong email - #1', (done) => {
    request.post('/api/auth/register')
      .set('Accept', 'application/json')
      .send({
        email: 'test@test',
        displayName: 'test',
        password: '12345',
        passwordCheck: '12345',
      })
      .end((err, res) => {
        expect(res.body.message).toBe('Invalid email address');
        expect(res.statusCode).toBe(400);
        done();
      });
  });

  it('Wrong email - #2', (done) => {
    request.post('/api/auth/register')
      .set('Accept', 'application/json')
      .send({
        email: 'te@st@test',
        displayName: 'test',
        password: '12345',
        passwordCheck: '12345',
      })
      .end((err, res) => {
        expect(res.body.message).toBe('Invalid email address');
        expect(res.statusCode).toBe(400);
        done();
      });
  });

  it('Undefined email', (done) => {
    request.post('/api/auth/register')
      .set('Accept', 'application/json')
      .send({
        displayName: 'test',
        password: '12345',
        passwordCheck: '12345',
      })
      .end((err, res) => {
        expect(res.body.message).toBe('Not all fields have been entered');
        expect(res.statusCode).toBe(400);
        done();
      });
  });

  it('Undefined password', (done) => {
    request.post('/api/auth/register')
      .set('Accept', 'application/json')
      .send({
        email: 'test@test.test',
        displayName: 'test',
        passwordCheck: '12345',
      })
      .end((err, res) => {
        expect(res.body.message).toBe('Not all fields have been entered');
        expect(res.statusCode).toBe(400);
        done();
      });
  });

  it('Undefined passwordCheck', (done) => {
    request.post('/api/auth/register')
      .set('Accept', 'application/json')
      .send({
        email: 'test@test.test',
        displayName: 'test',
        password: '12345',
      })
      .end((err, res) => {
        expect(res.body.message).toBe('Not all fields have been entered');
        expect(res.statusCode).toBe(400);
        done();
      });
  });

  it('Undefined displayName', (done) => {
    request.post('/api/auth/register')
      .set('Accept', 'application/json')
      .send({
        email: 'test@test.test',
        password: '12345',
        passwordCheck: '12345',
      })
      .end((err, res) => {
        expect(res.body.message).toBe('Not all fields have been entered');
        expect(res.statusCode).toBe(400);
        done();
      });
  });

  it('Correct data', (done) => {
    request.post('/api/auth/register')
      .set('Accept', 'application/json')
      .send({
        email: 'test@test.test',
        displayName: 'test',
        password: '12345',
        passwordCheck: '12345',
      })
      .end((err, res) => {
        expect(res.body.message).toBe('Register successful. Check your email to activate your account');
        expect(res.statusCode).toBe(201);
        expect(res.body.token).toBeDefined();
        activationToken = res.body.token;
        done();
      });
  });
});

describe('Login()', () => {
  it('Wrong email', (done) => {
    request.post('/api/auth/login')
      .set('Accept', 'application/json')
      .send({
        email: 'te@st@test',
        password: '12345',
      })
      .end((err, res) => {
        expect(res.body.message).toBe('Wrong email or password');
        expect(res.statusCode).toBe(400);
        done();
      });
  });

  it('Undefined email', (done) => {
    request.post('/api/auth/login')
      .set('Accept', 'application/json')
      .send({
        password: '12345',
      })
      .end((err, res) => {
        expect(res.body.message).toBe('Not all fields have been entered');
        expect(res.statusCode).toBe(400);
        done();
      });
  });

  it('Undefined password', (done) => {
    request.post('/api/auth/login')
      .set('Accept', 'application/json')
      .send({
        email: 'test@test.test',
      })
      .end((err, res) => {
        expect(res.body.message).toBe('Not all fields have been entered');
        expect(res.statusCode).toBe(400);
        done();
      });
  });

  it('Correct data before activation', (done) => {
    request.post('/api/auth/login')
      .set('Accept', 'application/json')
      .set('credentials', 'include')
      .send({
        email: 'test@test.test',
        password: '12345',
      })
      .end((err, res) => {
        expect(res.body.message).toBe('Account is not activated. Check your email');
        expect(res.statusCode).toBe(400);
        done();
      });
  });

  it('Activate account with wrong token', (done) => {
    request.post('/api/account/activateAccount')
      .set('Accept', 'application/json')
      .send({
        activationToken: 'wrongToken',
      })
      .end((err, res) => {
        expect(res.body.message).toBe('Wrong activation token');
        expect(res.statusCode).toBe(400);
        done();
      });
  });

  it('Activate account with undefined token', (done) => {
    request.post('/api/account/activateAccount')
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body.message).toBe('Undefined activation token');
        expect(res.statusCode).toBe(400);
        done();
      });
  });

  it('Activate account with correct data', (done) => {
    request.post('/api/account/activateAccount')
      .set('Accept', 'application/json')
      .send({
        activationToken,
      })
      .end((err, res) => {
        expect(res.body.message).toBe('Account activated successfully');
        expect(res.statusCode).toBe(200);
        done();
      });
  });

  it('Correct data after activation', (done) => {
    request.post('/api/auth/login')
      .set('Accept', 'application/json')
      .set('credentials', 'include')
      .send({
        email: 'test@test.test',
        password: '12345',
      })
      .end((err, res) => {
        expect(res.body.message).toBe('Logged in successfully');
        expect(res.statusCode).toBe(200);
        expect(res.body.user.id).toBeDefined();
        expect(res.body.user.displayName).toBe('test');
        cookies = res.headers['set-cookie'];
        done();
      });
  });

  it('Wrong JWT token', (done) => {
    request.post('/api/auth/verify')
      .set('Accept', 'application/json')
      .set('Cookie', ['jwt=WrongToken'])
      .end((err, res) => {
        expect(res.body.authenticated).toBe(false);
        done();
      });
  });

  it('Undefined JWT token', (done) => {
    request.post('/api/auth/verify')
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body.authenticated).toBe(false);
        done();
      });
  });

  it('Correct JWT token', (done) => {
    request.post('/api/auth/verify')
      .set('Accept', 'application/json')
      .set('Cookie', cookies)
      .end((err, res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.user.id).toBeDefined();
        expect(res.body.user.displayName).toBe('test');
        expect(res.body.message).toBe('Welcome back!');
        done();
      });
  });
});

describe('Account()', () => {
  it('Send forgot password', (done) => {
    request.post('/api/account/forgotPassword')
      .set('Accept', 'application/json')
      .send({
        email: 'test@test.test',
      })
      .end((err, res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Password reset link has been sent to your email');
        expect(res.body.passwordResetToken).toBeDefined();
        passwordResetToken = res.body.passwordResetToken;
        done();
      });
  });

  it('Verify reset token', (done) => {
    request.post('/api/account/verifyResetToken')
      .set('Accept', 'application/json')
      .send({
        email: 'test@test.test',
        passwordResetToken,
      })
      .end((err, res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Token accepted');
        done();
      });
  });

  it('Reset password', (done) => {
    request.post('/api/account/resetPassword')
      .set('Accept', 'application/json')
      .send({
        email: 'test@test.test',
        passwordResetToken,
        newPassword: 'newTest',
        newPasswordCheck: 'newTest',
      })
      .end((err, res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Password reset successfully');
        done();
      });
  });

  it('Login with new password', (done) => {
    request.post('/api/auth/login')
      .set('Accept', 'application/json')
      .set('credentials', 'include')
      .send({
        email: 'test@test.test',
        password: 'newTest',
      })
      .end((err, res) => {
        expect(res.body.message).toBe('Logged in successfully');
        expect(res.statusCode).toBe(200);
        expect(res.body.user.id).toBeDefined();
        expect(res.body.user.displayName).toBe('test');
        cookies = res.headers['set-cookie'];
        done();
      });
  });
});

describe('Clear()', () => {
  it('Delete user', (done) => {
    request.post('/api/auth/delete')
      .set('Accept', 'application/json')
      .set('Cookie', cookies)
      .send({
        email: 'test@test.test',
      })
      .end((err, res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Deleted successfully');
        done();
      });
  });
});
