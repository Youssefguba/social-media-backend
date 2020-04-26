const mongoose = require('mongoose');
const {postSchema} = require('../models/post');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');


const userProfile = mongoose.Schema({
    followers: [{"member_id": String, "follower_name": String, "profile_pic": String}], //['Ahmed Mohamed', 'Youssef mohamed']
    following: [{"member_id": String, "follower_name": String, "profile_pic": String}], //['Ahmed Mohamed', 'Youssef mohamed']
    chat_rooms: Array,        // Chats page of User.
    notification: Array,      //List of Notification of user
})

const userSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    username: String,         //username
    first_name: String,
    last_name: String,
    email: {type: String, unique: true},            //email
    password: String,
    birthday: String,         //birthday
    posts: [postSchema],
    isActive: Boolean,        // Status of User Active or !Active
    isAdministrator: {type: Boolean, default: false}, // user isAdministrator or !
    user_profile: [userProfile],
    profile_pic: String,      // /public/profile_pic/username/user.png
    joined_date: {
        type: Date,
        default: Date.now
    },        // Date of User joined on it
});

// comparing if the password entered is correct
userSchema.methods.validPassword = function(password){
    return bcrypt.compare(password ,this.password);
}

/* Validation User within response to the server */
function validateUser(post){
    const schema = Joi.object().keys({
        username: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
        isAdmin: Joi.boolean().required()
    });
    schema.validate(post)
}


module.exports = {
    User: mongoose.model('User', userSchema),
    userSchema: userSchema,
    validateUser: validateUser
}
