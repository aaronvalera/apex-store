const categoriesRouter = require("express").Router();
const Category = require("../models/category.js");

categoriesRouter.get("/", async (req, res) => {
    try {
        const categories = await Category.find({}).lean();
        return res.status(200).json({ success: true, data: categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return res.status(500).json({ success: false, message: "Error fetching categories." });
    }
});

module.exports = categoriesRouter;