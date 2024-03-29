const mongoose = require("mongoose");
const {Schema} = mongoose;

const addressSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            default: "Bangladesh"
        },
        zipCode: {
            type: String,
            required: true
        },
        fullName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            unique: true,
            required: true
        },
    }, {timestamps: true , versionKey: false}
);


const Address = mongoose.model("Address", addressSchema);
module.exports =Address;