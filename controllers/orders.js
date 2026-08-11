const ordersRouter = require("express").Router();
const Order = require("../models/order.js");

ordersRouter.post("/", async (req, res) => {
    const { products, totalPrice, shippingAddress, paymentIntentId } = req.body;

    try {
        if (!req.user) {
            return res.status(401).json({ message: "User must be authenticated to create an order." });
        }


        if (!products || products.length === 0) {
            return res.status(400).json({ message: "Order must contain at least one product." });
        }

        if (!shippingAddress || !shippingAddress.recipientName || !shippingAddress.streetAddress || !shippingAddress.city) {
            return res.status(400).json({ message: "Incomplete shipping address information." });
        }
        
        if (!paymentIntentId) {
            return res.status(400).json({ message: "Payment transaction reference is required." });
        }

        const existingOrder = await Order.findOne({
            "paymentDetails.transactionReference": paymentIntentId
        });

        if (existingOrder) {
            return res.status(200).json(existingOrder);
        }

        const orderNumber = `APX-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

        const newOrder = new Order({
            orderNumber,
            user: req.user._id,
            products: products.map(item => ({
                product: item.product || item.productId || item.id,
                name: item.name,
                size: item.size || "",
                colorName: item.colorName || "",
                image: item.image || "",
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                subtotal: Number(item.quantity) * Number(item.unitPrice)
            })),
            totalPrice: Number(totalPrice),
            status: "processing",
            shippingAddress: {
                recipientName: shippingAddress.recipientName,
                phoneNumber: shippingAddress.phoneNumber,
                streetAddress: shippingAddress.streetAddress,
                addressDetails: shippingAddress.addressDetails || "",
                city: shippingAddress.city,
                state: shippingAddress.state,
                zipCode: shippingAddress.zipCode || "",
                country: shippingAddress.country || ""
            },
            paymentDetails: {
                type: "card",
                provider: "Stripe",
                paymentStatus: "paid",
                transactionReference: paymentIntentId
            }
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error("Error creating order:", error.message);
        res.status(500).json({ message: "Failed to create order: ", error: error.message });
    }
});

module.exports = ordersRouter;