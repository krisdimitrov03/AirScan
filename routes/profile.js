const router = require('express').Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { User, Role } = require('../models');

router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, { include: [Role] });
    res.render('profile/profile', { title: 'Profile', user, error: null });
  } catch (err) {
    res.redirect('/auth/login');
  }
});

router.get('/edit', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id);
    res.render('profile/edit', { title: 'Edit Profile', user, error: null });
  } catch (err) {
    res.redirect('/profile');
  }
});

router.post('/edit', verifyToken, async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findByPk(req.user.user_id);
    if (!user) throw new Error('User not found');
    user.username = username;
    user.email = email;
    await user.save();
    res.redirect('/profile');
  } catch (err) {
    res.render('profile/edit', { title: 'Edit Profile', user: req.body, error: err.message });
  }
});

router.get('/delete', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id);
    res.render('profile/delete', { title: 'Delete Profile', user, error: null });
  } catch (err) {
    res.redirect('/profile');
  }
});

router.post('/delete', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id);
    if (!user) throw new Error('User not found');
    await user.destroy();
    res.clearCookie('token');
    res.redirect('/');
  } catch (err) {
    res.redirect('/profile');
  }
});

module.exports = router;
