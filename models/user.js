const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    passwordHash: String,
    gender: String,
    rol: {
        type: String,
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
    }
});

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