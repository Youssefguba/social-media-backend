const router = require('express').Router()
const passport = require('passport');



//  Signup ====================================================================
router.post('/signup', passport.authenticate('local-signup', {
	failureRedirect : '/auth/signup',
	failureFlash : false // allow flash messages
}), function(req, res, next)  {
	// res.redirect('/')
	res.send("Registration Success!")
});

// Login ====================================================================
router.post('/login', passport.authenticate('local-login', {
	failureRedirect : '/auth/login',
	failureFlash : false // allow flash messages
}), function(req, res, next)  {
	// res.redirect('/')
	res.send("Login Success!")

});


// LOGOUT ==============================
router.get('/logout', function(req, res, next) {
	req.logout();
	// res.redirect('/');
});



module.exports = router;