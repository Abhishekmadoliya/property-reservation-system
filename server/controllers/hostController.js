const User = require('../model/user.model');

// Apply to become a host
const applyToBecomeHost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { about, location, experience } = req.body;

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if user is already a host
        if (user.role === 'host') {
            return res.status(400).json({
                success: false,
                message: "You are already a host"
            });
        }

        // Update user with host info and directly make them a host (skip approval step)
        user.hostInfo = {
            about: about || '',
            location: location || '',
            experience: experience || ''
        };
        user.hostApplicationStatus = 'approved';
        user.hostApplicationDate = new Date();
        user.role = 'host'; // Directly set role to host

        await user.save();

        res.status(200).json({
            success: true,
            message: "You're now a host! You can start listing properties.",
            data: {
                applicationStatus: user.hostApplicationStatus,
                applicationDate: user.hostApplicationDate,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error setting up host account",
            error: error.message
        });
    }
};

// Get host application status
const getHostApplicationStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                applicationStatus: user.hostApplicationStatus,
                applicationDate: user.hostApplicationDate,
                role: user.role,
                hostInfo: user.hostInfo
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching host application status",
            error: error.message
        });
    }
};

// Admin only: Approve or reject host application
const processHostApplication = async (req, res) => {
    try {
        const { userId, status } = req.body;
        
        if (!userId || !status) {
            return res.status(400).json({
                success: false,
                message: 'User ID and status are required'
            });
        }
        
        if (status !== 'approved' && status !== 'rejected') {
            return res.status(400).json({
                success: false,
                message: 'Status must be either "approved" or "rejected"'
            });
        }
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        if (!user.hostApplicationStatus || user.hostApplicationStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'No pending host application found for this user'
            });
        }
        
        // Update the user's host application status
        user.hostApplicationStatus = status;
        
        // If approved, update the role to host
        if (status === 'approved') {
            user.role = 'host';
        }
        
        await user.save();
        
        return res.status(200).json({
            success: true,
            message: `Host application ${status} successfully`,
            data: {
                userId: user._id,
                username: user.username,
                role: user.role,
                hostApplicationStatus: user.hostApplicationStatus
            }
        });
    } catch (error) {
        console.error('Error processing host application:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process host application',
            error: error.message
        });
    }
};

// Get all host applications for admin
const getAllHostApplications = async (req, res) => {
    try {
        // Find users with pending host applications
        const users = await User.find({
            hostApplicationStatus: { $exists: true, $ne: null }
        }).select('username email role hostInfo hostApplicationStatus hostApplicationDate');

        // Transform the data for easier consumption by the client
        const applications = users.map(user => ({
            userId: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            hostInfo: user.hostInfo || {},
            applicationStatus: user.hostApplicationStatus,
            applicationDate: user.hostApplicationDate
        }));

        return res.status(200).json({
            success: true,
            data: {
                applications
            }
        });
    } catch (error) {
        console.error('Error fetching host applications:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch host applications',
            error: error.message
        });
    }
};

module.exports = {
    applyToBecomeHost,
    getHostApplicationStatus,
    getAllHostApplications,
    processHostApplication
}; 