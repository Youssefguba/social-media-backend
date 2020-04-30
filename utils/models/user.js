const mongoose = require('mongoose');
const { postSchema } = require('../models/post');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    username:   String,    //username
    first_name: String,
    last_name:  String,
    email: {type: String, unique: true},   //email
    password:   String,
    birthday:   String,    //birthday
    posts: [postSchema],
    saved_posts: [postSchema],
    isActive: Boolean,   // Status of User Active or !Active
    isAdministrator: {type: Boolean, default: false},   // user isAdministrator or !
    chat_rooms: Array,
    followers: [{member_id: mongoose.Schema.Types.ObjectId, follower_name: String, profile_pic: String}], //['Ahmed Mohamed', 'Youssef mohamed']
    following: [{member_id: mongoose.Schema.Types.ObjectId, followed_name: String, profile_pic: String}], //['Ahmed Mohamed', 'Youssef mohamed']
    profile_pic: String,    // /public/profile_pic/username/user.png
    notification: Array,   // List of Notification of user
    joined_date: {
        type: Date,
        default: Date.now
    },  // Date of User joined on it
});

// generating a hash
// passwords are not saved to the database as is. Instead, they are hashed first, then saved.
// hashes are always the same for the same password given the same "salt".
userSchema.statics.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// comparing if the password entered is correct
userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password ,this.password);
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
