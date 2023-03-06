const mongoose = require("mongoose");
const {Schema} = mongoose;

const catSchema = new Schema(
    {
        email:{
            type: String,
            trim:true,
        },
        name:{
            type: String,
            trim:true,
            require: true,
            maxLength: 32,
        },
        products: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Product',
            }
        ],
        photo: {
            data: Buffer,
            contentType: String
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            require: true,
        },
    }, {timestamps: true , versionKey: false}
);

const Category = mongoose.model("Category", catSchema);
module.exports =Category;