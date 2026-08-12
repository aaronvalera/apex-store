const addressesRouter = require("express").Router();
const mongoose = require("mongoose");
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

addressesRouter.delete("/:id", async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid address ID format." });
    }

    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized." });

        const address = await MailingAddress.findById(id);
        if (!address) {
            return res.status(404).json({ message: "Shipping address not found." });
        }

        if (address.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this address." });
        }

        const wasDefault = address.isDefault;

        await MailingAddress.findByIdAndDelete(id);
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { mailingAddresses: id }
        });

        if (wasDefault) {
            const nextAddress = await MailingAddress.findOne({ user: req.user._id });
            if (nextAddress) {
                nextAddress.isDefault = true;
                await nextAddress.save();
            }
        }

        return res.status(200).json({ message: "Address deleted successfully." });
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete address.", error: error.message });
    }
});

module.exports = addressesRouter;