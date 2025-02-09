const router = require('express').Router();

router.get('/login', async (req, res) => {
    res.render('auth/login', { title: 'Login' });
});

module.exports = router;
