const Category = require("../models/category.js")

const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

const buildProductFilter = async ({ search, category, size, maxPrice }) => {
  const filter = {};

  if(search) {
    filter.name = { $regex: escapeRegex(search), $options: "i" };
  }

  if(category && category.toLowerCase() !== "all") {
    const cleanCategory = escapeRegex(category.trim());
    const categoryDocument = await Category.findOne({ 
      name: { $regex: new RegExp(`^${cleanCategory}$`, "i") } 
    }).select("_id").lean();

    filter.categories = categoryDocument ? categoryDocument._id : null;
  }

  if(size) {
    filter["variants.sizes.size"] = size;
  }

  if(maxPrice && !isNaN(Number(maxPrice))) {
    filter.price = { $lte: Number(maxPrice) };
  }

  return filter;
};

const getPagination = (page, limit) => {
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const limitPerPage = Math.max(1, parseInt(limit, 10) || 6);
  const skip = (currentPage - 1) * limitPerPage;
  
  return { currentPage, limitPerPage, skip };
};

module.exports = { buildProductFilter, getPagination }; 