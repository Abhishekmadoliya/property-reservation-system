const User = require("../model/user.model");

const verifyHost = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Check if user is a host or admin
        if (user.role === 'host' || user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: "Access denied. Host privileges required"
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error verifying host status",
            error: error.message
        });
    }
};

module.exports = verifyHost; 