const paymentsRouter = require("express").Router();
const PaymentMethod = require("../models/paymentMethod.js");
const User = require("../models/user.js");
const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

paymentsRouter.post("/create-payment-intent", async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || typeof amount !== "number" || amount <= 0) {
            return res.status(400).json({ message: "Invalid payment amount. Amount must be greater than 0." });
        }

        const amountInCents = Math.round(amount * 100);
        let stripeCustomerId = null;

        if (req.user) {
            const user = await User.findById(req.user._id);

            if (user) {
                if (user.stripeCustomerId) {
                    stripeCustomerId = user.stripeCustomerId;
                } else {
                    const customer = await stripe.customers.create({
                        email: user.email,
                        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
                        metadata: { userId: user._id.toString() }
                    });

                    user.stripeCustomerId = customer.id;
                    await user.save();
                    stripeCustomerId = customer.id;
                }
            }
        }
        
        const paymentIntentConfig = {
            amount: amountInCents,
            currency: "usd",
            automatic_payment_methods: { enabled: true },
            metadata: {
                userId: req.user?._id?.toString() || "guest",
                userEmail: req.user?.email || "unknown"
            }
        };

        if (stripeCustomerId) {
            paymentIntentConfig.customer = stripeCustomerId;
            paymentIntentConfig.setup_future_usage = 'off_session';
        }

        const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig);

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Stripe PaymentIntent error:", error.message);
        res.status(500).json({ message: "Failed to initialize payment: ", error: error.message });
    }
});

// POST /api/payments/save-method - Guarda el método de pago en la BD
paymentsRouter.post("/save-method", async (req, res) => {
    const { paymentMethodId } = req.body;

    try {
        if (!req.user) {
            return res.status(200).json({ message: "Guest payment, not linked to user." });
        }

        if (!paymentMethodId) {
            return res.status(400).json({ message: "paymentMethodId is required." });
        }

        const existingMethod = await PaymentMethod.findOne({
            user: req.user._id,
            "cardDetails.stripePaymentMethodId": paymentMethodId
        });

        if (existingMethod) {
            return res.status(200).json(existingMethod);
        }

        const stripePaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
        
        const realLastFour = stripePaymentMethod.card?.last4 || "----";
        const paymentType = stripePaymentMethod.type || "card";

        const newPaymentMethod = new PaymentMethod({
            user: req.user._id,
            type: paymentType,
            provider: "Stripe",
            cardDetails: {
                cardLastFour: realLastFour,
                stripePaymentMethodId: paymentMethodId
            }
        });

        const savedPaymentMethod = await newPaymentMethod.save();

        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { paymentMethods: savedPaymentMethod._id }
        });

        res.status(201).json(savedPaymentMethod);
    } catch (error) {
        res.status(400).json({ message: "Error saving payment method: ", error: error.message });
    }
});

module.exports = paymentsRouter;

module.exports = paymentsRouter;