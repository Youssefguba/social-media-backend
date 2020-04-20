const mongoose = require('mongoose');
const {User} = require('../models/user');


mongoose.connect('mongodb://localhost/ameen', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));


/* Add Post via User */
async function addPost(userId, post) {
    let user = await User.findById(userId);
    if (user) {
        user.posts.push(post);
        user.save()
        console.log(user);
    } else {
        console.log('No User Found!')
    }
}
// addPost('5e9db18f332a414ae0f1b72d', new Post({body: 'Hello World Iam one '}));

/* remove Post of User */
async function removePost(userId, postId){
        let user =  await User.findById(userId).select('posts');
    if (user){
        let post = user.posts.id(postId);
            if (post) {
                post.remove();
                user.save();
            } else {
                console.log('Post Not Found!');
            }
        } else {
            console.log('User Not Found!');
    }
}

// removePost('5e9db18f332a414ae0f1b72d', '5e9db1d5d696e5050473f703');
