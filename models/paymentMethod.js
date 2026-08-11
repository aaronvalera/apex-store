const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ["card", "zelle", "pago_movil", "paypal"]
    },
    provider: {
        type: String,
        required: true
    },
    cardDetails: {
        cardLastFour: String,
        stripePaymentMethodId: String,
        expirationMonth: Number,
        expirationYear: Number
    },
    zelleDetails: {
        holderEmail: String,
        holderName: String
    },
    pagoMovilDetails: {
        phoneNumber: String,
        idDocument: String,
        bankName: String
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

paymentMethodSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);

module.exports = PaymentMethod;