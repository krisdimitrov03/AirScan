const router = require('express').Router();

const authRouter = require('./auth');
const dashboardRouter = require('./dashboard');

router.get('/', (req, res) => {
  res.render('index', { title: 'Home Page' });
});

router.use('/auth', authRouter);
router.use('/dashboard', dashboardRouter);

module.exports = router;
