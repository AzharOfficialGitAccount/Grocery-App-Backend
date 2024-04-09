const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    countryCode: {
        type: String,
        default: '+91'
    },
    phoneNumber: {
        type: Number,
    },
    otp: {
        type: Number,
    },
    email: {
        type: String
    },
    userName: {
        type: String
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
    },
    isNewUser: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    token: {
        type: String
    }
},
    {
        timestamps: true,
        versionKey: false
    }
);
const User = mongoose.model('User', userSchema);

module.exports = User;
