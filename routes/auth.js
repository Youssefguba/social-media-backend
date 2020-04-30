const router = require('express').Router()
const passport = require('passport');


// LOGOUT ==============================
router.get('/logout', function(req, res, next) {
	req.logout();
	res.redirect('/');
});

// Login ====================================================================
router.post('/login', passport.authenticate('local-login', {
	failureRedirect : '/auth/login',
	failureFlash : false // allow flash messages
}), function(req, res, next)  {
	// res.redirect('/')
	res.send("Login Success!")

});

//  Signup ====================================================================
router.post('/signup', passport.authenticate('local-signup', {
	failureRedirect : '/auth/signup',
	failureFlash : false // allow flash messages
}), function(req, res, next)  {
	// res.redirect('/')
	res.send("Registration Success!")
});


module.exports = router;