const User = require("../model/user.model");
const bcrypt = require("bcrypt");

const signupHandler = async (req, res) => {
    try {
        const { username, email, password, number } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { number }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email or phone number already exists"
            });
        }
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create new user
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            number
        });
        
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error during signup",
            error: error.message
        });
    }
};

module.exports = signupHandler;