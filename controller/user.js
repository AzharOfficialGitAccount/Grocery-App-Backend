const User = require('../model/user');
const helper = require('../config/helper');

module.exports = {

    sendOtp: async (req, res) => {
        try {
            const { phoneNumber, countryCode } = req.body;
            if (!phoneNumber) {
                return res.status(400).json({ status: false, message: "Please provide phoneNumber" });
            }
            if (!countryCode) {
                return res.status(400).json({ status: false, message: "Please provide country code" });
            }
            const otp = helper.otpGenerate();
            const otpOpj = { phoneNumber, otp };

            let checkUser = await User.findOne({ phoneNumber, isDeleted: false });
            if (!checkUser) {
                const userObj = new User({
                    countryCode,
                    phoneNumber,
                    otp,
                });
                checkUser = await userObj.save();
            } else {
                checkUser.otp = otp;
                await checkUser.save();
            }

            const token = helper.generateAuthJwt({
                _id: checkUser._id,
                expiresIn: process.env.TOKEN_EXPIRES_IN,
                phoneNumber: checkUser.phoneNumber,
            });
            const updateToken = await User.findByIdAndUpdate({ _id: checkUser._id }, { token: token });
            if (!updateToken) {
                return res.status(403).json({ status: false, message: "failed to create token!" });
            }
            const otpSent = await helper.generateOtpWithMSG91(otpOpj);
            if (!otpSent) {
                return res.status(500).json({ status: false, message: "Failed to send OTP" });
            }
            const data = {
                otp,
                token
            }
            return res.status(200).json({ status: true, message: "User otp sent successfully", data });
        } catch (error) {
            console.error("Error", error);
            return res.status(500).json({ status: false, message: "An error occurred", error: error.message });
        }
    },

    verifyOtp: async (req, res) => {
        try {
            const { otp } = req.body;
            const userId = req.token;

            const user = await User.findOne({ _id: userId._id, isDeleted: false });
            if (!user) {
                return res.status(400).json({ status: false, message: "User not found!" });
            }
            if (String(user.otp) !== String(otp)) {
                return res.status(400).json({ status: false, message: "Invalid OTP" });
            }
            user.otp = null;
            await user.save();

            const isNewUser = user.isNewUser

            const token = helper.generateAuthJwt({
                _id: user._id,
                expiresIn: process.env.TOKEN_EXPIRES_IN,
                phoneNumber: user.phoneNumber,
            });
            const data = {
                token,
                isNewUser
            }
            const updateToken = await User.findByIdAndUpdate({ _id: user._id }, { token: token });
            if (!updateToken) {
                return res.status(403).json({ status: false, message: "failed to create token!" });
            }
            return res.status(200).json({ status: true, data, message: "OTP verified successfully" });
        } catch (error) {
            console.error("Error", error);
            return res.status(500).json({ status: false, message: "An error occurred", error: error.message });
        }
    },

    createProfile: async (req, res) => {
        try {
            const { userName, email, gender } = req.body;
            const userId = req.token;

            if (!email) {
                return res.status(400).json({ status: false, message: 'email not found' });
            }
            const findUser = await User.findOne({ _id: userId._id });
            if (!findUser) {
                return res.status(404).json({ status: false, message: 'User not found' });
            }
            if (userName) {
                findUser.userName = userName;
            }
            if (email) {
                findUser.email = email;
            }
            if (gender) {
                findUser.gender = gender;
            }
            const updateUser = await User.findByIdAndUpdate(findUser._id, { $set: { isNewUser: false } }, { new: true });
            await findUser.save();

            const responseObj = {
                poneNumber: findUser.phoneNumber,
                email: findUser.email,
                userName: findUser.userName,
                gender: findUser.gender,
                isNewUser: updateUser.isNewUser
            }
            return res.status(201).json({ status: true, message: 'User created', data: responseObj });
        } catch (err) {
            return res.status(500).json({ status: false, message: 'Failed to create', error: err.message });
        }
    }
}