const router = require('express').Router();
const { registerUser, loginUser } = require('../services/authService');

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login', error: null });
});

router.get('/signup', (req, res) => {
  res.render('auth/signup', { title: 'Sign Up', error: null });
});

router.post('/signup', async (req, res) => {
  try {
    const { username, password, roleName, email } = req.body;
    await registerUser(username, password, roleName, email);
    res.render('auth/login', { title: 'Login', error: 'Registration successful. Please log in.' });
  } catch (err) {
    res.render('auth/signup', { title: 'Sign Up', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const token = await loginUser(username, password);
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');
  } catch (err) {
    res.render('auth/login', { title: 'Login', error: err.message });
  }
});

module.exports = router;
