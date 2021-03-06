const express = require('express');
const router = express.Router();

const { User, validateUser } = require('../utils/models/user');
const verifyToken = require('../controllers/verifyToken');

const jwt = require('jsonwebtoken');
const config = require('../config/app');


router.post('/signup', async (req, res) => {
	try {
		const {username, email, password} = req.body;
		const user = new User({
			username,
			email,
			password,
		});
		user.password = await User.generateHash(password);
		/// Check if the Email is existed or not ..
		User.findOne({'email': email}).exec(async (err, email) => {
			if (email) {
				res.status(409).send('User is Already Exist');
			} else {
				await validateUser(user);
				await user.save();
				const token = jwt.sign({id: user._id}, config.secret, {
					expiresIn: "1h",
				});
				res.status(200).json({auth: true, token, userId: user._id});
			}
		});

	} catch (e) {
		console.log(e);
		res.status(500).send('There was a problem sign up')
	}
});

router.post('/signin', async (req, res) => {
	try{
		await User.findOne({email: req.body.email}).exec(async (err, user) => {
			if (!user) {
				res.status(404).send('The email does not exist!');
			}
			const validPassword = await user.validPassword(req.body.password, user.password );
			if (!validPassword) {
				return res.status(401).send({auth: false, token: null});
			}
			const token = jwt.sign({id: user._id}, config.secret, {
				expiresIn: "24h",
			});
			res.status(200).json({auth: true, token, userId: user._id, username: user.username});
			});
	} catch (e) {
		console.log(e);
		res.status(500).send('There was a Sign In problem.')

	}
});

router.get('/logout', async (req, res ) => {
	res.status(200).send({auth: false, token: null});
});

module.exports = router;