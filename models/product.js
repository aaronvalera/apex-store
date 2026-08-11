const mongoose = require("mongoose");

const cloudinaryImageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    publicID: { type: String, required: true }
}, { _id: false });

const sizeStockSchema = new mongoose.Schema({
    size: {
        type: String,
        required: true,
        enum: ["XS", "S", "M", "L", "XL", "XXL"]
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    }
}, { _id: false });

const variantSchema = new mongoose.Schema({
    colorName: { type: String, required: true, trim: true },
    colorHex: { type: String, required: true, default: "#000000" },
    sku: { type: String, required: true, unique: true, trim: true },
    images: [cloudinaryImageSchema],
    sizes: [sizeStockSchema]
}, { _id: false });

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    material: {
        type: String,
        trim: true,
        default: "100% Cotton"
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    }],
    variants: [variantSchema],
    isNewProduct: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

productSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

productSchema.index({ createdAt: -1 });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;