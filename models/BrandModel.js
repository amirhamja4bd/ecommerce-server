const mongoose = require("mongoose");
const {Schema} = mongoose;

const brandSchema = new Schema(
    {
        email:{
            type: String,
            trim:true,
        },
        name:{
            type: String,
            trim:true,
            require: true,
            unique: true,
            maxLength: 32,
        },
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

const Brand = mongoose.model("Brand", brandSchema);
module.exports =Brand;