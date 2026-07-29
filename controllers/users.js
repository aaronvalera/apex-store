const usersRouter = require("express").Router();
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendVerificationEmail = require("../utils/sendEmailVerification.js");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

usersRouter.post("/", async (req, res) => {
    try {
        const { username, gender, email, password } = req.body;

        if(!username || !gender || !email || !password) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanUsername = username.trim().toLowerCase();

        if (!EMAIL_REGEX.test(cleanEmail)) {
            return res.status(400).json({ error: "Invalid email format." });
        }
        if (cleanUsername.length < 5 || cleanUsername.length > 20) {
            return res.status(400).json({ error: "Username must be between 5 and 20 characters." });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long." });
        }

        const existingUser = await User.findOne({ 
            $or: [{ email: cleanEmail }, { username: cleanUsername }]
         });
            if(existingUser) {
                if(existingUser.email === cleanEmail) {
                    return res.status(400).json({ error: "Email is already registered." });
                } else {
                    return res.status(400).json({ error: "Username is already taken." });
                }
            }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const newUser = new User({
            username: cleanUsername,
            gender,
            email: cleanEmail,
            passwordHash
        });
        const savedUser = await newUser.save();
        try {
            await sendVerificationEmail(savedUser.id, savedUser.email);
        } catch (emailError) {
            console.error("Failed to send verification email:", emailError.message);
        }
        return res.status(201).json({ message: "User registered successfully. Please check your email to verify your account."});
    } catch(error) {
        console.error("Error in user registration:", error);
        return res.status(500).json({ error: "Internal server error. Please try again later." });
    }
});

usersRouter.patch("/:id/:token", async (req, res) => {
    const { id: paramId, token } = req.params;

    try {
        const verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (verifiedToken.id !== paramId) {
            return res.status(400).json({ error: "Invalid verification link parameters." });
        }
        
        const user = await User.findById(paramId);
        if (!user) {
            return res.status(404).json({ error: "The user associated with this link no longer exists." });
        }
        if (user.verified) {
          return res.status(400).json({ error: "This account has already been verified." });
        }
        user.verified = true;
        await user.save();

        return res.status(200).json({ message: "Your account has been successfully verified. You can now Sign In." });
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            const decoded = jwt.decode(token);
            if (!decoded || decoded.id !== paramId) {
                return res.status(400).json({ error: "Invalid verification link parameters." });
            }

            try {
                const user = await User.findById(paramId);
                if (user && !user.verified) {
                    await sendVerificationEmail(user.id, user.email);
                    return res.status(400).json({ error: "The link has expired. A new verification link has been sent to your email." });
                }
            } catch (emailError) {
                console.error("Error sending automatic re-verification email:", emailError);
            }
            return res.status(400).json({ error: "The link has expired. Please request a new verification link." });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(400).json({ error: "Invalid or malformed verification token." });
        }
        console.error("Error during verification:", error);
        return res.status(500).json({ error: "An unexpected error occurred during verification." });
    }
});

module.exports = usersRouter;