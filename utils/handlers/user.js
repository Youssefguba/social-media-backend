const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {User} = require('../models/user');
const {Post} = require('../models/post');

mongoose.connect(require('../../config/app').db.connectionUri, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));


/**
 *
 Create a new User
 *
 usage:
 createNewUser(opt, (error, result)=> {
		if(!result) return false;
		// Do some post-save stuff here
	})

 ** Example:
 createNewUser( {username: "youssef",
  first_name: "youssef",
   last_name: "ahmed",
    email:"you1@gmail.com",
     password: "adfafadsfasdfasdf"},
   ()=> {
    console.log("Hello There is Error Here")
});

 **/
function createNewUser(obj, callback) {
    User.findOne({email: obj.email}).exec(async (err, user) => {
        console.log("We are here");
        if (user) {
           console.log('User is found!');
           return callback(null, false);
       } else {
           let newUser = new User({
               username: obj.username,
               first_name: obj.first_name,
               last_name: obj.last_name,
               email: obj.email,
               birthday: obj.birthday,
               profile_pic: "PUT Here default photo",
               followers: [],
               following: [],
               notification: [],
               posts: [],
               isActive: true
           });
            // (1) Generate salt then hash password ..
            const salt = await bcrypt.genSalt(10);
            newUser.password = await bcrypt.hash(obj.password, salt);
            // (2) Then Save the User .
            await newUser.save();
            // console.log("Are you listen me ??");
        }
    });
}
// createNewUser( {username: "youssef",
//         first_name: "youssef",
//         last_name: "ahmed",
//         email:"youssef2@gmail.com",
//         password: "adfafadsfasdfasdf"},
//     ()=> {
//         console.log("Hello There is Error Here")
//     });

/**
 * Add Post via User
 * usage:
 *     addPost(userId, new Post({body: 'Hello World!'}));
 * */
async function addPost(userId, obj) {
    //Find User By ID.
     await User.findById(userId).exec(function(err,user){
        if (user) {
            // Push Post to User Posts List
            let newPost = new Post({
                body: obj.body,
                authorId: userId
            });
            user.posts.push(newPost)
            user.save();
            Post.find().exec(() => {
                //TODO => Handle error if user is Anonymous
                newPost.save();
            })
        } else {
            console.log('No User Found!')
        }
    });
}
// addPost("5ea19b21b000443c2c0c1a2d", new Post({
//     body: "Hello World!"
// }))

/**
 * Delete Post of User
 *
 * usage:
 *     deletePost('5e9df5ec32bc5d49e4b852f8', '5e9e36c5742d5022e857e70a');
 * */

async function deletePost(userId, postId){
    //Find User By ID.
    let user =  await User.findById(userId);
    if (user){
        // Find Post of User.
        let post = user.posts.id(postId);
            if (post) { // Remove It and change in database.
                post.remove();
                user.save();
            } else {
                console.log('Post Not Found!');
            }
        } else {
            console.log('User Not Found!');
    }
}

async function updatePost(userId, postId, obj) {
    //Find User By ID.
    await User.findById(userId).exec(async (err, user) => {
        if(!user) return console.log('User Not Found!');
        // Find Body of post's user to change it's body.
        user.posts.id(postId).body = obj.body;

        await Post.findByIdAndUpdate(postId, {body: obj.body, authorId:userId}, { new: true }, async (err,post) => {
            if (!post) return console.log("Post is not Found!")
            await post.save();
        });

        user.posts.body = obj.body;
        await user.save()
    });

}

updatePost("5ea19b21b000443c2c0c1a2d", "5ea1bf3eebd1c336f0d2ec21", {body: "Hello !"})

