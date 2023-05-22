const mongoose = require("mongoose");
const validator = require('validator');
const {Schema} = mongoose;

const userSchema = new Schema(
    {
        email:{
            type: String,
            trim:true,
            required:[true, "Email address is required"],
            unique: [true, "Unique Email is required"],
            lowercase: true,
            // validate: [validator.isEmail, "Provide a valid Email"],
            // validate:[/^\S+@\S+\.\S+$/, "Provide a valid Email"],
        },
        firstName:{
            type: String,
            trim:true,
        },
        lastName:{
            type: String,
            trim:true,
        },
        fullName:{
            type: String,
            trim:true,
        },
        phone:{
            type: String,
            trim:true,
            require: [true, "Phone number is required"],
            // validate: [validator.isMobilePhone, "Provide a valid mobile number"],
            // match: [/^\d{11}$/ , "Provide Valid Bangladesh Mobile Number"]
        },
        password:{
            type: String,
            require: [true, "Password is required"],
            min: 6,
            max: 64,
        },
        role:{
            type: Number,
            default: 0,
        },
        // photo: {
        //     type: String,
        // },
        photo: {
            data: Buffer,
            contentType: String,
            // require: [true, "Photo is required"],
        },
        // address: {
        //     address: {
        //         type: String,
        //         default: ""
        //     },
        //     city: {
        //         type: String,
        //         default: ""
        //     },
        //     state: {
        //         type: String,
        //         default: ""
        //     },
        //     country: {
        //         type: String,
        //         default: ""
        //     },
        //     zipCode: {
        //         type: String,
        //         default: ""
        //     },
        // }
    }, {timestamps: true , versionKey: false}
);


const User = mongoose.model("User", userSchema);
module.exports =User;