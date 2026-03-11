const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        
        // Check user status in database
        const user = await User.findByPk(decoded.user.id);
        if (!user || user.status !== 'active') {
            const reason = !user ? 'Account not found' : 
                           user.status === 'pending' ? 'Account awaiting approval' : 
                           'Account suspended';
            return res.status(403).json({ message: `Access denied. ${reason}.` });
        }

        req.user = decoded.user;
        req.user.role = user.role; // Attach role to req.user for admin middleware
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};
module.exports = auth;
