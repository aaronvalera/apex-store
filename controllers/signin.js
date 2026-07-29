const signInRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user.js");

signInRouter.post("/", async (req, res) => {
    const { email, password, remember } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }
    const cleanEmail = email.trim().toLowerCase();
    
    try {
        const userExist = await User.findOne({ email: cleanEmail });
        const isPasswordCorrect = userExist 
            ? await bcrypt.compare(password, userExist.passwordHash) 
            : false;
        if(!userExist || !isPasswordCorrect) {
            return res.status(401).json({ error: "Invalid email or password." });
        }
        if(!userExist.verified) {
            return res.status(403).json({ error: "Email not verified." });
        }

        const userForToken = {
            id: userExist.id
        };
        const token = jwt.sign(userForToken, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: remember ? "30d" : "1d"
        });
        res.cookie("accessToken", token, {
            maxAge: remember
            ? 30 * 24 * 60 * 60 * 1000
            : 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: "strict"
        });
        return res.status(200).json({ message: "Signed in successfully." });
    } catch (error) {
        console.error("Sign In error", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = signInRouter;