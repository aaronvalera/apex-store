const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const userExtractor = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken;
        if (!accessToken) {
            return res.status(401).json({ message: "Authentication required: No token provided." });
        }

        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken.id).select("-password").lean();
        if (!user) {
            return res.status(401).json({ message: "Invalid session: User no longer exists." });
        }
        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

const adminExtractor = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied: Admin privileges required." });
    }
    
    next();
};

module.exports = { userExtractor, adminExtractor };