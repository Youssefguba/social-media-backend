const express = require('express');
const router = express.Router();
const {User, validate}  = require('../utils/models/user')

/*  GET Users Listing */
router.get('/', async (req, res) => {
    const user = await User.find();
    res.send(user);
});


router.get('/:id', async (req, res) => {
   let user = await User.findById(req.params.id)
       .select('username email posts');
   if (!user) return res.status(404).send('User is not found!.');

   res.send(user);
});

router.post('/', async (req, res) => {
    const  error  = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = new User({
        username: req.body.username,
        email:req.body.email,
    });
    user = await user.save();
    res.send(user);
});

module.exports = router;