const express = require('express');
const router = express.Router();
const { User, CommunityPost, Testimony } = require('../models');
const auth = require('../middleware/auth');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// Get online users (active in the last 15 minutes)
router.get('/online', auth, async (req, res) => {
    try {
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
        const onlineUsers = await User.findAll({
            where: {
                lastActiveAt: {
                    [Op.gte]: fifteenMinsAgo
                },
                status: 'active'
            },
            attributes: ['id', 'name', 'profilePicture', 'lastActiveAt'],
            order: [['lastActiveAt', 'DESC']],
            limit: 30
        });
        res.json(onlineUsers);
    } catch (error) {
        console.error('Failed to fetch online users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get public profile of any user
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: {
                exclude: ['password', 'email'], // Don't expose sensitive info
                include: [
                    [
                        sequelize.literal(`(SELECT COUNT(*) FROM CommunityPosts WHERE userId = User.id)`),
                        'postsCount'
                    ],
                    [
                        sequelize.literal(`(SELECT COUNT(*) FROM Testimonies WHERE userId = User.id)`),
                        'testimoniesCount'
                    ]
                ]
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get recent posts by this user
        const recentPosts = await CommunityPost.findAll({
            where: { userId: user.id },
            limit: 5,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            user,
            posts: recentPosts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
