const router = require('express').Router();
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, (req, res) => {
  res.render('analyst/dashboard', { title: 'Dashboard', user: req.user });
});

module.exports = router;
