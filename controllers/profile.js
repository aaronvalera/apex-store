const profileRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

profileRouter.get("/", async (req, res) => {
    const token = req.cookies?.accessToken;
    if(!token) {
        return res.status(401).json({ error: "Token missing." });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken.id);
        if(!user) {
            return res.status(401).json({ error: "User not found." });
        }

        return res.status(200).json({
            id: user.id,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        return res.status(401).json({ error: "Invalid token." });
    }
});

module.exports = profileRouter;