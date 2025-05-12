const User = require("../model/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const loginHandler = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        
        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "fallbacksecret",
            { expiresIn: "24h" }
        );
        
        res.json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error during login",
            error: error.message
        });
    }
};

module.exports = loginHandler;