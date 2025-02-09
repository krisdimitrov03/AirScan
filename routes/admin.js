const router = require('express').Router();
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/dashboard', verifyToken, authorizeRoles(['admin']), (req, res) => {
  res.json({ message: 'Welcome to admin dashboard' });
});

module.exports = router;
