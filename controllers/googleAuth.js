const googleAuthRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

googleAuthRouter.post("/google", async (req, res) => {
    const { credential, remember } = req.body;
    console.log("BODY RECIBIDO DE GOOGLE:", req.body);
    if (!credential) {
        return res.status(400).json({ error: "Google credential token is required." });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, email_verified } = payload;
        if (!email_verified) {
            return res.status(400).json({ error: "Google email is not verified." });
        }

        let user = await User.findOne({ $or: [{ googleId }, { email }] });
        if(!user) {
            const baseUsername = email.split("@")[0];
            const randomDigits = Math.floor(1000 + Math.random() * 9000);

            user = new User({
                username: `${baseUsername}_${randomDigits}`,
                email: email,
                googleId: googleId,
                authProvider: "google",
                verified: true
            });
            await user.save();
        } else if(!user.googleId) {
            user.googleId = googleId;
            user.authProvider = "google";
            await user.save();
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: remember ? "30d" : "1d" }
        );
        res.cookie("accessToken", token, {
            maxAge: remember
            ? 30 * 24 * 60 * 60 * 1000
            : 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: "lax"
        });
        return res.status(200).json({ message: "Logged in with Google successfully." });
    } catch (error) {
        console.error("Error verifying Google token:", error);
        return res.status(400).json({ error: "Invalid Google token." });
    }
});

module.exports = googleAuthRouter;