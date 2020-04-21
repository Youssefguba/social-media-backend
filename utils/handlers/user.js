const mongoose = require('mongoose');
const {User} = require('../models/user');
const {Post} = require('../models/post');

mongoose.connect(require('../../config/app').db.connectionUri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));




/* Create a new User */
async function createUser(username, email){
    let user = new User({
        // Get User Id to use it with posts
        username: username,
        email: email
    });
    user.save(function (err) {
        if (err) return handleError(err);
    });
}


/* Add Post via User */
async function addPost(userId, post) {
    //Find User By ID.
    await User.findById(userId).populate('posts').exec(function(err,user){
        if (err) return handleError(err);
        if (user) {
            // Push Post to User Posts List
            // user.posts.author_Id = user.id;
            user.posts.push(post);
            user.save();
            console.log(user)
        } else {
            console.log('No User Found!')
            console.log(user)

        }
    });

}
addPost('5e9f6b04bacc67204056acb6', new Post({body: 'Hello World One!'}));

/* remove Post of User */
async function deletePost(userId, postId){
    //Find User By ID.
    let user =  await User.findById(userId).select('posts');
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
// deletePost('5e9df5ec32bc5d49e4b852f8', '5e9e36c5742d5022e857e70a');

