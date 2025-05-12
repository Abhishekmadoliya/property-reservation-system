const jwt = require('jsonwebtoken');

const verifyUser = async (req, res, next) => {
    try {
        // Get token from header
        let token;
        
        if (req.header('Authorization') && req.header('Authorization').startsWith('Bearer')) {
            token = req.header('Authorization').replace('Bearer ', '');
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token, authorization denied"
            });
        }

        // Verify token
        // Note: Use the same secret that was used to create the token
        const secret = process.env.JWT_SECRET || 'fallbacksecret';
        const decoded = jwt.verify(token, secret);
        
        // Add user from payload
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token is not valid",
            error: error.message
        });
    }
};

module.exports = verifyUser; 