const mongoose = require("mongoose");

const mailingAddressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    recipientName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    streetAddress: {
        type: String,
        required: true,
        trim: true
    },
    addressDetails: {
        type: String,
        default: "",
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    zipCode: {
        type: String,
        required: true,
        trim: true,
        default: ""
    },
    country: {
        type: String,
        trim: true,
        required: true,
        default: "",
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

mailingAddressSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

const MailingAddress = mongoose.model("MailingAddress", mailingAddressSchema);

module.exports = MailingAddress;