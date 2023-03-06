const mongoose = require("mongoose");
const {Schema} = mongoose;

const paymentSchema = new Schema(
    {
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        amount: { 
            type: Number, 
            required: true 
        },
        paymentMethod: { 
            type: String, 
            required: true 
        },
        paymentResult: {
            id: { 
                type: String 
            },
            status: { 
                type: String 
            },
            update_time: { 
                type: String 
            },
        },
        isPaid: { 
            type: Boolean, 
            default: false 
        },
        paidAt: { 
            type: Date 
        },
        createdAt: { 
            type: Date, 
            default: Date.now 
        },
        updatedAt: { 
            type: Date, 
            default: Date.now 
        }
            }, {timestamps: true , versionKey: false}
        );

const Payment = mongoose.model("Payment", paymentSchema);
module.exports =Payment;