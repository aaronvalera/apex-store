const mongoose = require("mongoose");

// 1. Subesquema para las fotos en Cloudinary
const cloudinaryImageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    publicID: { type: String, required: true }
}, { _id: false });

// 2. Subesquema para el stock por talla
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

// 3. Subesquema de Variantes (Vincula Color + Sus Fotos + Sus Tallas)
const variantSchema = new mongoose.Schema({
    colorName: { type: String, required: true, trim: true }, // Ej: "Matte Black"
    colorHex: { type: String, required: true, default: "#000000" }, // Ej: "#000000"
    sku: { type: String, required: true, unique: true, trim: true }, // Ej: "APX-TS-001-BLK"
    images: [cloudinaryImageSchema], // Fotos exclusivas de este color
    sizes: [sizeStockSchema] // Stock independiente por talla para este color
}, { _id: false });

// 4. Esquema Principal del Producto
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
    variants: [variantSchema], // Arreglo con todas las combinaciones de color/fotos
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

// Limpieza de respuesta JSON para el frontend
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