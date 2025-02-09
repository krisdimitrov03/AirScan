const router = require('express').Router();
const { registerUser, loginUser } = require('../services/authService');

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

router.post('/signup', async (req, res) => {
  try {
    // JSON body is to be: { username, password, roleName, email }
    // console.log(req.body);
    const { username, password, roleName, email } = req.body;
    const user = await registerUser(username, password, roleName, email);
    res.status(201).json({ message: 'User registered', user_id: user.user_id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const token = await loginUser(username, password);
    res.cookie('token', token, { httpOnly: true });
    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

module.exports = router;
