const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String
    },
    googleId: {
        type: String,
        default: null
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        lowercase: true,
        trim: true
    },
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    },
    paymentMethods: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "PaymentMethod"
    }],
    mailingAddresses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "MailingAddress"
    }],
    verified: {
        type: Boolean,
        default: false
    },
    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    }
}, { timestamps: true });

userSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject.passwordHash;
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;