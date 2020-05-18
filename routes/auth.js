const express = require('express');
const router = express.Router();

const { User } = require('../utils/models/user');
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
		await user.save();

		const token = jwt.sign({id: user._id}, config.secret, {
			expiresIn: "24h",
		});
		res.status(200).json({auth: true, token});
	} catch (e) {
		console.log(e);
		res.status(500).send('There was a problem sign up')
	}
});

router.post('/signin', async (req, res) => {
	try{
		const user = await User.findOne({email: req.body.email});
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
		res.status(200).json({auth: true, token});
	} catch (e) {
		console.log(e);
		res.status(500).send('There was a Sign In problem.')

	}
});

router.get('/logout', async (req, res ) => {
	res.status(200).send({auth: false, token: null});
});

module.exports = router;