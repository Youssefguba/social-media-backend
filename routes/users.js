const express = require('express');
const user = express.Router();
const {User, Images, validateUser}  = require('../utils/models/user')
const multer = require('multer');
const fs = require('fs');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    },
});

// const fileFilter = (req, file, callback) => {
//     if (file.mimeType === 'image/jpeg' || file.mimeType === 'image/png' || file.mimeType === 'image/jpg' ){
//         callback(null, true);
//     } else {
//         callback(new Error("Not Valid Type."), false);
//
//     }
// }

const upload = multer({storage: storage});



/*  GET Users List */
user.get('/', async (req, res) => {
    const user = await User.find();
    res.send(user);
});

// Create a New User..
user.post('/', async (req, res) => {
    const  error  = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = new User({
        username:   req.body.username,
        email:      req.body.email,
        first_name: req.body.first_name,
        last_name:  req.body.last_name,
        birthday:   req.body.birthday,
        isActive:   req.body.isActive,
    });
    user = await user.save();
    res.send(user);
});

// Get a specific user with his info.
user.get('/:userId', async (req, res) => {
   let user = await User.findById(req.params.userId)
       .select('username email posts');
   if (!user) return res.status(404).send('User is not found!.');
   res.send(user);
});

/*
* Get list of user followers.
* */
user.get('/:userId/followers', async (req, res) => {
    let user = await User.findById(req.params.userId).select('followers');
    if (!user) return res.status(404).send('User is not found!.');
    res.send(user);

})

/*
* Get list of user following.
* */
user.get('/:userId/following', async (req, res) => {
    let user = await User.findById(req.params.userId).select('following');
    if (!user) return res.status(404).send('User is not found!.');
    res.send(user);
})

/*
* Get list of user saved post.
* */
user.get('/:userId/saved', async (req, res) => {
    let user = await User.findById(req.params.userId).select('saved_posts');
    if (!user) return res.status(404).send('User is not found!.');
    res.send(user);
})

// Add image to user and encoded it
user.post('/:userId/images', upload.single('image'), async (req, res) => {
    let img = fs.readFileSync(req.file.path);
    let encode_image = img.toString('base64');
    // Define a JSON object for the image attributes for saving to database
    let finalImg = {
        contentType: req.file.mimetype,
        image:  new Buffer(encode_image, 'base64')
    };
        User.findById(req.params.userId).then(user => {
            user.profilePic = finalImg;

            console.log('saved to database')
            res.send(finalImg);
            user.save();
            Images.create(finalImg);
            Images.save(finalImg);

        });
});

// Get Image of User by ID..
user.get('/:userId/images/:id', upload.single('image'), async (req, res) => {
    let filename = req.params.id;
    console.log('filename:', filename)
    Images.findById({ '_id':filename }, (err, result) => {
        if (err) return console.log(err)
        res.contentType('image/jpeg' || 'image/png');
        res.send(result.image)
    });
});


module.exports = user;