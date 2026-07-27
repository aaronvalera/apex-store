const emailjs = require("@emailjs/nodejs");
const jwt = require("jsonwebtoken");
const { PAGE_URL } = require("../config.js");

const sendVerificationEmail = async (id, email) => {
    const token = jwt.sign(
        { id: id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
    );
    const verifyUrl = `${PAGE_URL}/verify/${id}/${token}`;
    try {
        await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_TEMPLATE_ID,
            {
                to_email: email,
                verify_url: verifyUrl
            },
            {
                publicKey: process.env.EMAILJS_PUBLIC_KEY,
                privateKey: process.env.EMAILJS_PRIVATE_KEY
            }
        );
    } catch (error) {
        console.error("Critical error sending verification email", error);
        throw error;
    }
}

module.exports = sendVerificationEmail;