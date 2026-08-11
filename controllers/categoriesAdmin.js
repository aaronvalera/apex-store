const categoriesAdminRouter = require("express").Router();
const Category = require("../models/category.js");

categoriesAdminRouter.post("/", async (req, res) => {
    const { name, image, description } = req.body;
    if(!name) {
        return res.status(400).json({ success: false, message: "Category name is required." });
    }

    try {
        const newCategory = new Category({ name, image, description });
        const savedCategory = await newCategory.save();
        return res.status(201).json({ success: true, data: savedCategory });
    } catch (error) {
        console.error("Error creating category:", error);
        return res.status(400).json({ success: false, message: "Error creating category.", error: error.message });
    }
});

categoriesAdminRouter.put("/:id", async (req, res) => {
    const { name, image, description } = req.body;

    try {
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, { name, image, description }, { new: true, runValidators: true });
        if(!updatedCategory) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }
        return res.status(200).json({ success: true, data: updatedCategory });
    } catch (error) {
        console.error("Error updating category:", error);
        return res.status(400).json({ success: false, message: "Error updating category.", error: error.message });
    }
});

categoriesAdminRouter.delete("/:id", async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if(!deletedCategory) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }
        return res.status(200).json({ success: true, message: "Category removed successfully." });
    } catch (error) {
        console.error("Error removing category:", error);
        return res.status(500).json({ success: false, message: "Error removing category.", error: error.message });
    }
});

module.exports = categoriesAdminRouter;