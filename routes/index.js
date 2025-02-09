const router = require('express').Router();

const authRouter = require('./auth');
const airportSlotsRouter = require('./airportSlots');

router.get('/', (_, res) => {
    res.render('index', { title: 'Home Page' });
});

router.use('/auth', authRouter);
router.use('/airport-slots', airportSlotsRouter);

module.exports = router;