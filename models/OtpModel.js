const  mongoose=require('mongoose');

const OTPSchema=mongoose.Schema({
    email:{
        type:String,
        lowercase: true, 
        trim: true 
    },
        otp:{
            type:String,
            lowercase: true, 
            trim: true
    },
        status:{
            type:Number,default:0
        },

},{timestamps: true, versionKey:false});

const OTPModel=mongoose.model('otps',OTPSchema);
module.exports=OTPModel

