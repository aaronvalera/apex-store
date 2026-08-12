const paymentsRouter = require("express").Router();
const mongoose = require("mongoose");
const PaymentMethod = require("../models/paymentMethod.js");
const User = require("../models/user.js");
const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

paymentsRouter.get("/methods", async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized access." });
        }

        const methods = await PaymentMethod.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json(methods);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch payment methods.", error: error.message });
    }
});

paymentsRouter.post("/save-method", async (req, res) => {
    const { type, cardDetails, zelleDetails, pagoMovilDetails, paypalDetails, paymentMethodId } = req.body;

    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized access." });
        }

        if (paymentMethodId && paymentMethodId.startsWith("pm_") && !paymentMethodId.startsWith("pm_simulated") && !paymentMethodId.startsWith("pm_manual")) {
            const existingMethod = await PaymentMethod.findOne({
                user: req.user._id,
                "cardDetails.stripePaymentMethodId": paymentMethodId
            });

            if (existingMethod) {
                return res.status(200).json(existingMethod);
            }
        }

        let newPaymentMethodData = {
            user: req.user._id,
            type: type || "card",
            provider: type === "card" ? "Credit/Debit Card" : (type === "paypal" ? "PayPal" : (type ? type.toUpperCase() : "STRIPE"))
        };

        if (type === "card" || !type) {
            if (paymentMethodId && paymentMethodId.startsWith("pm_") && !paymentMethodId.startsWith("pm_simulated") && !paymentMethodId.startsWith("pm_manual")) {
                const stripePaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
                newPaymentMethodData.cardDetails = {
                    cardLastFour: stripePaymentMethod.card?.last4 || "4242",
                    stripePaymentMethodId: paymentMethodId,
                    expirationMonth: stripePaymentMethod.card?.exp_month,
                    expirationYear: stripePaymentMethod.card?.exp_year
                };
            } else {
                const rawNumber = (cardDetails?.cardNumber || "").replace(/\s+/g, "");
                const cardLastFour = rawNumber.length >= 4 ? rawNumber.slice(-4) : "4242";

                newPaymentMethodData.cardDetails = {
                    cardLastFour,
                    stripePaymentMethodId: paymentMethodId || `pm_manual_${Date.now()}`,
                    expirationMonth: parseInt(cardDetails?.expirationMonth) || 12,
                    expirationYear: parseInt(cardDetails?.expirationYear) || 2028
                };
            }
        } else if (type === "zelle") {
            newPaymentMethodData.zelleDetails = {
                holderEmail: zelleDetails?.holderEmail || "",
                holderName: zelleDetails?.holderName || ""
            };
        } else if (type === "pago_movil") {
            newPaymentMethodData.pagoMovilDetails = {
                phoneNumber: pagoMovilDetails?.phoneNumber || "",
                idDocument: pagoMovilDetails?.idDocument || "",
                bankName: pagoMovilDetails?.bankName || ""
            };
        } else if (type === "paypal") {
            newPaymentMethodData.paypalDetails = {
                email: paypalDetails?.email || ""
            };
        }

        const newPaymentMethod = new PaymentMethod(newPaymentMethodData);
        const savedPaymentMethod = await newPaymentMethod.save();

        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { paymentMethods: savedPaymentMethod._id }
        });

        return res.status(201).json(savedPaymentMethod);
    } catch (error) {
        console.error("Error saving method:", error);
        return res.status(400).json({ message: "Error saving payment method.", error: error.message });
    }
});

paymentsRouter.delete("/methods/:id", async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid payment method ID format." });
    }

    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized." });

        const method = await PaymentMethod.findById(id);
        if (!method) {
            return res.status(404).json({ message: "Payment method not found." });
        }

        if (method.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this payment method." });
        }

        await PaymentMethod.findByIdAndDelete(id);
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { paymentMethods: id }
        });

        return res.status(200).json({ message: "Payment method removed successfully." });
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete payment method.", error: error.message });
    }
});

module.exports = paymentsRouter;