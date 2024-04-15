
const express = require("express");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userdb = require("../model/UserSchema");
const router = express.Router();
const keySecret = process.env.JWT_SECRET;

// POST /register: Handles user registration
router.post("/register", async (req, res) => {
    const { name, email } = req.body;

    // Validate input fields
    if (!name || !email) {
        return res.status(422).json({ error: "Please fill in all the required fields" });
    }

    try {
        // Check if user already exists
        const existingUser = await userdb.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Create a new user and save to the database
        const newUser = new userdb({ name, email });
        await newUser.save();

        // Generate a JWT token for the new user
        const token = await newUser.generateAuthtoken();

        

        // Set the token in a secure HTTP-only cookie
        res.cookie("usercookie", token, {
            expires: new Date(Date.now() + 9000000),
            httpOnly: true
        });

        // Create email options
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Set Password Link",
            text: `This link is valid for 15 minutes: http://localhost:3000/setpassword/${newUser._id}/${token}`,
        };

        // Configure email transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);

        // Respond with success
        res.status(201).json({ status: 201, message: "User registered and email sent successfully" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /setpassword/:id/:token: Verify user when setting password
router.get("/setpassword/:id/:token", async (req, res) => {
    const { id, token } = req.params;
    
    try {
        // Verify token and find the user
        const validUser = await userdb.findOne({ _id: id });
        
        if (validUser) {
            // Respond with user data for further processing
            res.status(201).json({ status: 201, validUser });
        } else {
            res.status(401).json({ status: 401, message: "User not found" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.post("/setpassword1/:userId", async (req, res) => {
    const { password, cpassword } = req.body;
    const { userId } = req.params;


    if (!password || !cpassword) {
        return res.status(422).json({ error: "Please fill in all the required fields" });
    }

    if (password !== cpassword) {
        return res.status(422).json({ error: "Passwords do not match" });
    }

    try {       
        // Find the user by ID
        const user = await userdb.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Hash the new password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;

        
        await user.save();

        
        res.status(201).json({ message: "Password set successfully" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;    

