const router = require('express').Router();
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, authorizeRoles(['analyst']), (req, res) => {
  res.json({ message: 'Welcome to analyst dashboard' });
});

module.exports = router;
