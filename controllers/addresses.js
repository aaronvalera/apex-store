const addressesRouter = require("express").Router();
const MailingAddress = require("../models/mailingAddress.js");
const User = require("../models/user.js");

addressesRouter.get("/", async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const addresses = await MailingAddress.find({ user: req.user._id });
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching addresses.", error: error.message });
    }
});

addressesRouter.post("/", async (req, res) => {
    const { title, recipientName, phoneNumber, streetAddress, addressDetails, city, state, zipCode, country, isDefault } = req.body;

    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        if (!title || !recipientName || !phoneNumber || !streetAddress || !city || !state || !zipCode || !country) {
            return res.status(400).json({ message: "All required shipping fields must be provided." });
        }

        const existingAddressesCount = await MailingAddress.countDocuments({ user: req.user._id });
        const shouldBeDefault = existingAddressesCount === 0 ? true : Boolean(isDefault);
        if (shouldBeDefault) {
            await MailingAddress.updateMany({ user: req.user._id }, { isDefault: false });
        }

        const newAddress = new MailingAddress({
            user: req.user._id,
            title,
            recipientName,
            phoneNumber,
            streetAddress,
            addressDetails,
            city,
            state,
            zipCode,
            country,
            isDefault: shouldBeDefault
        });
        const savedAddress = await newAddress.save();

        await User.findByIdAndUpdate(req.user._id, {
            $push: { mailingAddresses: savedAddress._id }
        });

        res.status(201).json(savedAddress);
    } catch (error) {
        res.status(400).json({ message: "Error saving address", error: error.message });
    }
});

module.exports = addressesRouter;