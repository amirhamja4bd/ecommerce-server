const mongoose = require("mongoose");
const {Schema} = mongoose;

const productSchema = new Schema(
    {
        email:{
            type: String,
            trim:true,
        },
        title:{
            type: String,
            trim:true,
            require: true,
            maxLength: 50,
        },
        description: {
            type: String,
            trim: true,
            maxLength: 5000,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            require: true,
        },
        photo: {
            data: Buffer,
            contentType: String
        },
        sku: {
            type: String,
            unique: true,
        },
        quantity: {
            type: Number,
            trim: true,
        },
        price: {
            type: Number,
            trim: true,
        },
        status: {
            type: String,
            default: "Published",
            enum: ['Draft', 'Published',]
        },
        unit: {
            type: String,
            trim: true,
        },
        sold: {
            type: Number,
            trim: true,
            default: 0
        },
        brand: {
            type: Schema.Types.ObjectId,
            ref: 'Brand',
        },
        category: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Category',
            }
        ],
        type: {
            type: String,
            required: true,
            enum: ["feature", "sale", "new", "bestdeal"],
            default: "",
          },

    }, {timestamps: true , versionKey: false}
);

// Generate SKU before saving the product
productSchema.pre('save', function(next) {
    const product = this;
    let zayan = "ZAYAN"
    if (!product.sku) {
        // Generate SKU using a combination of name and random number
        const sku = zayan.toUpperCase().replace(/[^A-Z0-9]/g, '') + '-' + Math.floor(Math.random() * 10000);
        product.sku = sku;
    }
    next();
});

const Product = mongoose.model("Product", productSchema);
module.exports =Product;