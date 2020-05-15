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
               // password: User.generateHash(obj.password),
               birthday: obj.birthday,
               profilePic: "PUT Here default photo",
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

// createNewUser( {username: "Hassaaan",
//         first_name: "Hassaaan ",
//         last_name: "Hassaaan",
//         email:"Hassaaan@gmail.com",
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
                createdAt: Date.now(),
                authorId: userId,
                authorName: user.username,
                authorPhoto: user.profilePic
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
// addPost("5ea673a3e674c34564009531", new Post({
//     body: "Hello World Two!"
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
// addComment("5eaf9a1491589d00176f541c", "5eba3c7d54b0f051544e428d", {comment_body: "Change Happened!!"})

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

    // Find Followed member Id in Following list of our User.
    let followedMemberId =  await user.following.find(function(followed){
        return followed.member_id === followedPersonId;
    })

    // Find Follower member Id in Followers list of second user.
    let followerMemberId = await followedPerson.followers.find(function (follower) {
        return follower.member_id === userId;
    })

    /*
    * Adding follower person to followers list ..
    * Begin
    * */
    let user_schema = {
        follower_name: user.username,
        member_id: userId,
        profilePic: user.profilePic,
    }
    // Check if User already in followers list or not.
    if (!followerMemberId) {
        await followedPerson.followers.push(user_schema)
    } else {
        console.log("You Already followed that person!")
    }/*
    * Adding follower person to followers list ..
    * End
    * */


    /*
    * Adding followed person to following list ..
    * Begin
    * */
    let followedPerson_schema = {
        followed_name: followedPerson.username,
        member_id:     followedPersonId,
        profilePic:    followedPerson.profilePic,
    }
    if (!followedMemberId){
        await user.following.push(followedPerson_schema)
    } else {
        console.log("User is already followed!");
    }
    /*
    * Adding followed person to following list ..
    * End
    * */
    user.save();
    followedPerson.save();
}

// followUser("5ea673ab0a30833f501da496","5ea673a3e674c34564009531")

/**
 *
 * Un Follow another person..
 *
 **/
async function unfollowUser(userId, followedPersonId ) {
    let user = await User.findById(userId);
    let followedPerson = await User.findById(followedPersonId);

    // Find Followed member Id in Following list of our User to remove him from following list.
    let followedMemberId =  await user.following.find(function(followed){
        return followed.member_id
    })
    followedMemberId ? followedMemberId.remove() : console.log("You already unfollowed him.")

    // Find Follower member Id in Followers list of second user to remove him from followers list.
    let followerMemberId = await followedPerson.followers.find(function (follower) {
        return follower.member_id;
    })
    followerMemberId ? followerMemberId.remove() : console.log("You already unfollowed him.")
    user.save();
    followedPerson.save();
}

/*
* Add post to Saved Posts
* */
async function savePost(userId, postId) {
    let user = await User.findById(userId);
    let post = await Post.findById(postId);

    // Check if post is already in Saved Posts to add it..
    if (!user.saved_posts.id(postId)){
        await user.saved_posts.push(post);
    } else {
        console.log("Post is already Saved!")
    }

    await user.save()
}

/*
* Begin of  Add Reactions  [ Ameen , recommend , forbidden ]
* */

/* Ameen Reaction */
async function ameenButton(userId, postId) {
    let user_info  = await User.findById(userId).select("id username");
    let mainUser = await User.findById(userId);
    let post  = await Post.findById(postId);
    let _user = await User.findById(post.authorId);
    // TODO (1) => Check if the user liked this post or not!

    /*
    * We made this to make changes happen in database when user click on "Ameen" button..
    * */
    // (*) Check if the user is the owner of post or not..
    // (1) If the user is /not/ the owner..
    if (!(mainUser.posts.id(postId))) {
        //.. then find the place of post in User collection to push post to the list..
        await _user.posts.id(postId).reactions.ameen.push(user_info);
        await post.reactions.ameen.push(user_info)
    } else {
        // (2) If the user is the Owner..
        await mainUser.posts.id(postId).reactions.ameen.push(user_info);
        await post.reactions.ameen.push(user_info)
    }
    await mainUser.save();
    await post.save();
    await _user.save();
}

ameenButton("5eaf9a1491589d00176f541c","5eb9e28fc41c4d0017244ae7")

/* Recommend Button Reaction */
async function recommendButton(userId, postId) {
    let user_info  = await User.findById(userId).select("id username profilePic");
    let mainUser = await User.findById(userId);
    let post  = await Post.findById(postId);
    let _user = await User.findById(post.authorId);
    // TODO (1) => Check if the user liked this post or not!
    /*
    * We made this to make changes happen in database when user click on "Ameen" button..
    * */
    // (*) Check if the user is the owner of post or not..

    // (1) If the user is /not/ the owner..
    if (!(mainUser.posts.id(postId))) {
        //.. then find the place of post in User collection to push post to the list..
            await _user.posts.id(postId).recommendReaction.push(user_info);
            await post.recommendReaction.push(user_info)
    } else {
        // (2) If the user is the Owner..
            // Check if already the user liked this post before or not.
                await mainUser.posts.id(postId).recommendReaction.push(user_info);
                await post.recommendReaction.push(user_info)
    }
    await mainUser.save();
    await post.save();
    await _user.save();
}
recommendButton("5eaf9a1491589d00176f541c","5eb9e28fc41c4d0017244ae7")

 /* Forbidden Button Reaction */
async function forbiddenButton(userId, postId) {
    let user_info  = await User.findById(userId).select("id username profilePic");
    let mainUser = await User.findById(userId);
    let post  = await Post.findById(postId);
    let _user = await User.findById(post.authorId);
    // TODO (1) => Check if the user liked this post or not!

    /*
    * We made this to make changes happen in database when user click on "Ameen" button..
    * */
    // (*) Check if the user is the owner of post or not..
    // (1) If the user is /not/ the owner..
    if (!(mainUser.posts.id(postId))) {
        //.. then find the place of post in User collection to push post to the list..
            await _user.posts.id(postId).forbiddenReaction.push(user_info);
            await post.forbiddenReaction.push(user_info)
    } else {
        // (2) If the user is the Owner..
                await mainUser.posts.id(postId).forbiddenReaction.push(user_info);
                await post.forbiddenReaction.push(user_info)
            }
    await mainUser.save();
    await post.save();
    await _user.save();
}

/*
* End of Reactions Section [ Ameen , recommend , forbidden ]
* */

/*
* Begin of Remove Reaction  [ Ameen , recommend , forbidden ]
* */
async function removeAmeenReaction(userId, postId) {
    let mainUser   = await User.findById(userId);
    let post  = await Post.findById(postId);
    let _user = await User.findById(post.authorId);
    // TODO (1) => Check if the user liked this post or not!
    /*
    * We made this to make changes happen in database when user click on "Ameen" button..
    * */
    // (*) Check if the user is the owner of post or not..
    // (1) If the user is /not/ the owner..

    //TODO remove the reaction of the user that liked the post ..

    if (!(mainUser.posts.id(postId))) {
        // .. then find the place of post in User collection to push post to the list..
       let userPosts = await _user.posts.id(postId).ameenReaction.find(async function (reactions) {
            return reactions._id
        })
       let posts = await post.ameenReaction.find(async function (reactions) {
            return reactions._id
        })
        userPosts.remove();
        posts.remove();

    } else {
        // (2) If the user is the Owner..
        let userPosts = await mainUser.posts.id(postId).ameenReaction.find(async function (reactions) {
            return reactions._id
        })
        let posts = await post.ameenReaction.find(async function (reactions) {
            return reactions._id
        })
        userPosts.remove();
        posts.remove();

    }

    await mainUser.save();
    await post.save();
    await _user.save();
}

async function removeRecommendReaction(userId, postId) {
    let mainUser   = await User.findById(userId);
    let post  = await Post.findById(postId);
    let _user = await User.findById(post.authorId);
    // TODO (1) => Check if the user liked this post or not!
    /*
    * We made this to make changes happen in database when user click on "Ameen" button..
    * */
    // (*) Check if the user is the owner of post or not..
    // (1) If the user is /not/ the owner..

    //TODO remove the reaction of the user that liked the post ..

    if (!(mainUser.posts.id(postId))) {
        // .. then find the place of post in User collection to push post to the list..
        let userPosts = await _user.posts.id(postId).recommendReaction.find(async function (reactions) {
            return reactions._id
        })
        let posts = await post.recommendReaction.find(async function (reactions) {
            return reactions._id
        })
        userPosts.remove();
        posts.remove();

    } else {
        // (2) If the user is the Owner..
        let userPosts = await mainUser.posts.id(postId).recommendReaction.find(async function (reactions) {
            return reactions._id
        })
        let posts = await post.recommendReaction.find(async function (reactions) {
            return reactions._id
        })
        userPosts.remove();
        posts.remove();

    }

    await mainUser.save();
    await post.save();
    await _user.save();
}

async function removeForbiddenReaction(userId, postId) {
    let mainUser   = await User.findById(userId);
    let post  = await Post.findById(postId);
    let _user = await User.findById(post.authorId);
    // TODO (1) => Check if the user liked this post or not!
    /*
    * We made this to make changes happen in database when user click on "Ameen" button..
    * */
    // (*) Check if the user is the owner of post or not..
    // (1) If the user is /not/ the owner..

    //TODO remove the reaction of the user that liked the post ..

    if (!(mainUser.posts.id(postId))) {
        // .. then find the place of post in User collection to push post to the list..
        let userPosts = await _user.posts.id(postId).forbiddenReaction.find(async function (reactions) {
            return reactions._id
        })
        let posts = await post.forbiddenReaction.find(async function (reactions) {
            return reactions._id
        })
        userPosts.remove();
        posts.remove();

    } else {
        // (2) If the user is the Owner..
        let userPosts = await mainUser.posts.id(postId).forbiddenReaction.find(async function (reactions) {
            return reactions._id
        })
        let posts = await post.forbiddenReaction.find(async function (reactions) {
            return reactions._id
        })
        userPosts.remove();
        posts.remove();

    }

    await mainUser.save();
    await post.save();
    await _user.save();
}


/*
* End of Remove Reaction  [ Ameen , recommend , forbidden ]
* */