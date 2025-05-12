const User = require("../model/user.model");

const verifyAdmin = async (req, res, next) => {
    try {
        // Check if user exists
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Since there's no role field in the model, we'll use the email to check if user is admin
        // This is for testing purposes only - in production, you should add a proper role field
        const adminEmails = ['admin@example.com', 'admin@pms.com'];
        
        if (!adminEmails.includes(user.email)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error verifying admin status",
            error: error.message
        });
    }
};

module.exports = verifyAdmin; 