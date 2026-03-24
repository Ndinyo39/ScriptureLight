const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { CommunityPost, User } = require('../models');
const rateLimit = require('express-rate-limit');

const postLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 posts per window
    message: { message: 'Too many posts created from this IP, please try again after 15 minutes' }
});

// Get all community posts
router.get('/', async (req, res) => {
    try {
        const posts = await CommunityPost.findAll({
            order: [['createdAt', 'DESC']],
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'profilePicture', 'bio']
            }]
        });
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new post (auth required)
router.post('/', auth, postLimiter, async (req, res) => {
    try {
        const { content, scripture, type } = req.body;
        const post = await CommunityPost.create({
            userId: req.user.id,
            content,
            scripture,
            type: type || 'encouragement'
        });
        
        // Fetch post with user info for response
        const fullPost = await CommunityPost.findByPk(post.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'profilePicture', 'bio']
            }]
        });
        
        res.json(fullPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Pray for a post (increment prayCount)
router.post('/:id/pray', auth, async (req, res) => {
    try {
        const post = await CommunityPost.findByPk(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        
        let prayedUsers = post.prayedBy || [];
        
        if (prayedUsers.includes(req.user.id)) {
            return res.status(400).json({ message: 'You have already prayed for this post' });
        }
        
        prayedUsers.push(req.user.id);
        post.prayedBy = prayedUsers;
        post.prayCount += 1;
        await post.save();
        
        const updatedPost = await post.reload();
        res.json(updatedPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Record a view for a post
router.post('/:id/view', auth, async (req, res) => {
    try {
        const post = await CommunityPost.findByPk(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        
        let viewedUsers = post.viewedBy || [];
        
        // Only increment if user hasn't viewed before
        if (!viewedUsers.includes(req.user.id)) {
            viewedUsers.push(req.user.id);
            post.viewedBy = viewedUsers;
            post.viewCount += 1;
            await post.save();
        }
        
        res.json({ viewCount: post.viewCount });
    } catch (error) {
        console.error('Error recording view:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a post (auth required, must be owner)
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await CommunityPost.findByPk(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
        
        await post.destroy();
        res.json({ message: 'Post removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;