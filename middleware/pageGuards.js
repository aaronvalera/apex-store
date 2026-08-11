const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const userPageGuard = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken;
        if (!accessToken) {
            return res.redirect("/signin");
        }

        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken.id).select("-password").lean();
        if (!user) {
            return res.redirect("/signin");
        }
        req.user = user;
        
        next();
    } catch (error) {
        return res.redirect("/signin");
    }
};

const adminPageGuard = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.redirect("/home");
    }
    next();
};

module.exports = { userPageGuard, adminPageGuard };