const mongoose = require("mongoose");
const {Schema} = mongoose;

const wishlistSchema = new mongoose.Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
        },
        isLiked:{
            type: Boolean,
            default: false,
        },
    }, {timestamps: true , versionKey: false}
);

const WishList = mongoose.model("WishList", wishlistSchema);
module.exports =WishList;