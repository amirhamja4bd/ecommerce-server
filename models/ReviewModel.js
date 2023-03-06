const mongoose = require("mongoose");
const {Schema} = mongoose;

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
        },
        content:{
            type: String,
            trim:true,
            require: true,
        },
        rating: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            default: "waiting-approval",
            enum: ["waiting-approval","rejected", "approved"]
        },
        photo: {
            data: Buffer,
            contentType: String,
            default: ""
        },
    }, {timestamps: true , versionKey: false}
);

const Review = mongoose.model("Review", reviewSchema);
module.exports =Review;