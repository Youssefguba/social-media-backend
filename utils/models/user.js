const mongoose = require('mongoose');
const { postSchema } = require('../models/post');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    username:   {type: String, trim: true},    //username
    first_name: String,
    last_name:  String,
    email: {type: String, unique: true, lowercase: true, trim: true},   //email
    password:   {type: String, trim: true},
    birthday:   String,    //birthday
    posts: [postSchema],
    saved_posts: [postSchema],
    isActive: Boolean,   // Status of User Active or !Active
    isAdministrator: {type: Boolean, default: false},   // user isAdministrator or !
    chat_rooms: Array,
    followers: [{member_id: mongoose.Schema.Types.ObjectId, follower_name: String, profilePic: String}], //['Ahmed Mohamed', 'Youssef mohamed']
    following: [{member_id: mongoose.Schema.Types.ObjectId, followed_name: String, profilePic: String}], //['Ahmed Mohamed', 'Youssef mohamed']
    profilePic: {imageId: mongoose.Schema.ObjectId, type:Object},    // /public/profilePic/username/user.png
    notification: Array,  // List of Notification of user
    joined_date: {
        type: Date,
        default: Date.now
    },  // Date of User joined on it
});

const imageSchema = new mongoose.Schema({
    image: {type: Buffer},
    contentType: String,
    path: String,

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
function validateUser(user){
    const schema = Joi.object().keys({
        username: Joi.toString().trim(),
        email: Joi.string().email().lowercase().trim().required(),
    });
    schema.validate(user)
}


module.exports = {
    User: mongoose.model('User', userSchema),
    Images: mongoose.model('Images', imageSchema),
    userSchema: userSchema,
    validateUser: validateUser
}
