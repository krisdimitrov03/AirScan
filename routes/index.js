const router = require('express').Router();
const authRouter = require('./auth');

const airportSlotsRouter = require('./airportSlots');
const dashboardRouter = require('./dashboard');
const profileRouter = require('./profile');

router.get('/', (req, res) => {
  res.render('index', { title: 'Home Page' });
});

router.use('/auth', authRouter);
router.use('/dashboard', dashboardRouter);
router.use('/profile', profileRouter);
router.use('/auth', authRouter);
router.use('/airport-slots', airportSlotsRouter);

module.exports = router;
