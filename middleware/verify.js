const jwt = require('jsonwebtoken');
const User = require('../model/user');

exports.verifyToken = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (!token) return res.status(401).json({ status: false, message: "UNAUTHORIZED" });

        token = token.replace(/^Bearer\s+/, '');

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decoded.userId || decoded._id;

        const checkJwt = await User.findOne({ _id: userId });
        if (!checkJwt) {
            const userCondition = { _id: userId, isActive: false, isDeleted: true };
            const checkUser = await User.findOne(userCondition);

            if (checkUser) return res.status(401).json({ status: false, message: "UNAUTHORIZED" });
        } else {
            const userCondition = { _id: checkJwt.userId, isDeleted: false, isActive: false };

            const checkUser = await User.findOne(userCondition);
            if (checkUser) return res.status(400).json({ status: false, message: "UNAUTHORIZED" });
            req.token = decoded;
            return next();
        }
    } catch (err) {
        console.error('Error in verifyToken middleware:', err);
        return res.status(400).json({ status: false, message: "something went wrong" });
    }
};
