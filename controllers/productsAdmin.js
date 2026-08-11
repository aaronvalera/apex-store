const productsAdminRouter = require("express").Router();
const mongoose = require("mongoose");
const Product = require("../models/product.js");

productsAdminRouter.post("/", async (req, res) => {
    const { name, description, price, material, categories, variants, isNewProduct, isFeatured, isActive } = req.body;
    try {
        const newProduct = new Product({ name, description, price, material, categories, variants, isNewProduct, isFeatured, isActive });
        const savedProduct = await newProduct.save();
        await savedProduct.populate("categories");

        return res.status(201).json({ success: true, data: savedProduct });
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(400).json({ success: false, message: "Error creating product.", error: error.message });
    }
});

productsAdminRouter.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, description, price, material, categories, variants, isNewProduct, isFeatured, isActive } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid product ID format." });
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, { name, description, price, material, categories, variants, isNewProduct, isFeatured, isActive }, { new: true, runValidators: true }).populate("categories");
        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        return res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(400).json({ success: false, message: "Error updating product.", error: error.message });
    }
});

productsAdminRouter.delete("/:id", async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid product ID format." });
    }

    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        return res.status(200).json({ success: true, message: "Product deleted successfully." });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ success: false, message: "Error deleting product.", error: error.message });
    }
});

module.exports = productsAdminRouter;