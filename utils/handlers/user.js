const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {User} = require('../models/user');
const {Post, Comment} = require('../models/post');

mongoose.connect(require('../../config/app').db.connectionUri, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    .then(()   => console.log('Connected to MongoDB...'))
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
     password: "adfafadsfasdfasdf" },
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
// createNewUser( {username: "Ahmed",
//         first_name: "Ahmed ",
//         last_name: "Mohamed",
//         email:"Ahmed2@gmail.com",
//         password: "adfafadsfasdfasdf"},
//     ()=> {
//         console.log("Hello There is Error Here")
//     });

/* Login User */
// passport.use(new LocalStrategy({
//         emailField: 'email',
//         passwordField: 'password'
//     },
//     async function loginUser (email, password, done) {
//         User.findOne({ email: email }, function(err, user) {
//             if (err) { return done(err); }
//             if (!user) {
//                 return done(null, false, { message: 'Incorrect username.' });
//             }
//             if (!user.validPassword(password)) {
//                 return done(null, false, { message: 'Incorrect password.' });
//             }
//             return done(null, user);
//         });
//     },
// ));
//


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
                authorId: userId,
                authorName: user.username,
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
// addPost("5ea4f40392b19a16a4a75c03", new Post({
//     body: "Hello World One!"
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
    let homePost = await Post.findById(postId);
    //Find Post in Home Page and remove it..
    !homePost ?  console.log("Post is not found") : homePost.remove();
    if (user){
        // Find Post in User Profile to remove it..
        let post = user.posts.id(postId);
        // Remove post of user and save the changes..
        post ? post.remove() : console.log('Post Not Found!');
        user.save()
        } else {
            console.log('User Not Found!');
    }
}
// deletePost("5ea4f40392b19a16a4a75c03", "5ea4f91417149441fc32154c");

/**
 * Update Post of User
 *
 * usage:
 *     updatePost('5e9df5ec32bc5d49e4b852f8', '5e9e36c5742d5022e857e70a', {body: "Change Happened!!"});
 * */
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
// updatePost("5ea19b21b000443c2c0c1a2d", "5ea1bf3eebd1c336f0d2ec21", {body: "Hello !"})

/**
 * add comment on Post of User
 *
 * usage:
 *     addComment(authorId, postId, {comment_body: "Change Happened!!"});
 * */
async function addComment(authorId, postId, obj) {
    // Find User By ID => then find Post by Id
    let user =  await User.findById(authorId);
    let post =  await Post.findById(postId);
    if (user) {
        if (post) {
            // Add comment properties.
            let newComment = new Comment({
                comment_body: obj.comment_body,
                authorId: authorId,
                authorName: user.username,
                postId: postId
            });
            // Push Comment for Post collection.
            post.comments.push(newComment);
            await post.save(newComment);
            // Push Comment for Comment collection.
            await newComment.save();
            // Find comment of post's user to push comment to it.. then save to User Collection.
            user.posts.id(postId).comments.push(newComment);
            await user.save();
        }
    }
}

/**
 * delete comment on Post of User
 *
 * usage:
 *     deleteComment(userId, postId, commentId);
 * */
async function deleteComment(userId, postId, commentId) {
    //Find User & Post & Comment By ID.
    let user =  await User.findById(userId);
    let post =  await Post.findById(postId);
    let collection_comment = await Comment.findById(commentId);
    //Find Comment in Comment Collection and remove it..
    if (user){
        if (post){
            // Find comment in (User & Post) Collections to remove it..
            let user_collection_comment = await user.posts.id(postId).comments.id(commentId);
            let post_collection_comment = await post.comments.id(commentId);

            // Remove post of user in ( User & Post & Comment ) Collections..
            user_collection_comment ? await user_collection_comment.remove() : console.log("Comment is not found");
            post_collection_comment ? await post_collection_comment.remove() : console.log("Comment is not found");
            collection_comment      ? await collection_comment.remove()      : console.log("Comment is not found");
            // Save the changes in ( User & Post & Comment ) Collections..
            user.save();
            post.save();
            collection_comment.save();

        } else { console.log('Post Not Found!') }
        } else { console.log('User Not Found!') }
}

/**
 *
 * Follow another person..
 *
 **/
async function followUser(userId, followedPersonId) {
    let user = await User.findById(userId);
    let followedPerson = await User.findById(followedPersonId);

    // Person who press follow
    let user_schema = {
        follower_name: user.username,
        member_id: userId,
        profile_pic: user.profile_pic,
    }
    await followedPerson.followers.push(user_schema)

    // Followed Person..
    let followedPerson_schema = {
        followed_name: followedPerson.username,
        member_id:     followedPersonId,
        profile_pic:   followedPerson.profile_pic,
    }
    await user.following.push(followedPerson_schema)

    console.log(await user.following.hasOwnProperty(followedPersonId.toString()))

    user.save();
    followedPerson.save();

}

followUser("5ea673a3e674c34564009531", "5ea673ab0a30833f501da496")