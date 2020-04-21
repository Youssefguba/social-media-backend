const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {User} = require('../models/user');
const {Post} = require('../models/post');

mongoose.connect(require('../../config/app').db.connectionUri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

/* Create a new User */
/*****
 usage:
 var opt = {
		username:'my_name',
		password:'P@sSW0rD',
		fn:'Divy',
		ln:'Srivastava',

	}
 createNewUser(opt, (error, result)=> {
		if(!result) return false;
		// Do some post-save stuff here
	})
 *****/
function createNewUser(obj, cb) {
    User.findOne({email: obj.email}).exec(async (err, user) => {
        if (user) {
            console.log('User is found!');
            return cb(null, false);
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
                isActive: true,
            });
            // const salt = await bcrypt.genSalt(10);
            // newUser.password = await bcrypt.hash(newUser.password, salt);
            await newUser.save();
        }
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
// addPost('5e9f6b04bacc67204056acb6', new Post({body: 'Hello World One!'}));

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

