const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    size: {
        type: String,
        default: ""
    },
    colorName: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [orderItemSchema],
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending"
    },
    shippingAddress: {
        recipientName: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        },
        streetAddress: {
            type: String,
            required: true
        },
        addressDetails: String,
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            default: ""
        },
        country: {
            type: String,
            default: ""
        }
    },
    paymentDetails: {
        type: { 
            type: String, 
            enum: ["card", "zelle", "pago_movil", "paypal"],
            required: true 
        },
        provider: { 
            type: String, 
            required: true 
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending"
        },
        transactionReference: {
            type: String,
            default: ""
        }
    }
}, { timestamps: true });

orderSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;