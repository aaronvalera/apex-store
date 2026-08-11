const productsRouter = require("express").Router();
const mongoose = require("mongoose");
const { buildProductFilter, getPagination } = require("../utils/buildProductFilter.js");
const Product = require("../models/product.js");

const SORT_OPTIONS = {
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  "name-asc": { name: 1 },
  "newest": { createdAt: -1 }
};

productsRouter.get("/", async (req, res) => {
    try {
        const { search, category, size, maxPrice, sort, page = 1, limit = 6} = req.query;

        const { currentPage, limitPerPage, skip } = getPagination(page, limit);
        const filter = await buildProductFilter({ search, category, size, maxPrice });

        const [totalProducts, products] = await Promise.all([
            Product.countDocuments(filter),
            Product.find(filter).populate("categories").sort(SORT_OPTIONS[sort] || {}).skip(skip).limit(limitPerPage).lean()
        ]);

        const totalPages = Math.ceil(totalProducts / limitPerPage) || 1;

        return res.status(200).json({ success: true, totalProducts, totalPages, currentPage, count: products.length,  data: products });

    } catch (error) {
        console.error("Error filtering products: ", error);
        return res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
    }
});

productsRouter.get("/:id", async (req, res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID format." });
        }

    try {
        const product = await Product.findById(id).populate("categories").lean();
        if(!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        return res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error("Error fetching product:", error);
        return res.status(500).json({ success: false, message: "Invalid product ID or server error.", error: error.message });
    }
});

module.exports = productsRouter;