const mongoose = require("mongoose");
const validator = require ("validator");
const jwt = require("jsonwebtoken") 

const { JWT_SECRET } = process.env;


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true 
    },
    email:{
        type: String,
        required: true,
        unique:true,
        validate(value){ // We use validator funtion beacuse if we add any other value instead of mail then it will throw the error.  
            if(!validator.isEmail(value)){
                throw new Error("It is not valid email")
            }
        }
    },
    password: {
        type:String,
        minlength:9
    },
    cpassword: {
        type:String,
        minlength:9
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            }
        }
    ],
    tokens: [
        {
            token: {
                type: String,
                required: true,
            }
        }
    ],
});


//token generate 
 // Make sure JWT_SECRET is defined in your environment variables

userSchema.methods.generateAuthtoken = async function() {
    try {
        // Generate a new token
        const token = jwt.sign({ _id: this._id }, JWT_SECRET, { expiresIn: '30d' });

        // Save the new token to the user's tokens array
        this.tokens.push({ token });

        // Save the user document to the database
        await this.save();

        // Log the tokens for debugging
        console.log(this.tokens);


        // Return the newly generated token
        return token;
    } catch (error) {
        // Handle errors if any
        throw new Error(error);
    }
};

// creating model
const userdb = new mongoose.model("setpasswordmail",userSchema); 
module.exports = userdb;