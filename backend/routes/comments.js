const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Comment, User, CommunityPost, Testimony } = require('../models');

// H-1: Strip HTML tags to prevent Stored XSS
const stripHtml = (str) => (typeof str === 'string' ? str.replace(/<[^>]*>/g, '').trim() : str);
const MAX_COMMENT_LENGTH = 2000;

// Get comments for a specific post
router.get('/post/:postId', async (req, res) => {
    try {
        const comments = await Comment.findAll({
            where: { 
                postId: req.params.postId,
                status: 'approved'
            },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profilePicture'] }],
            order: [['createdAt', 'ASC']]
        });
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get comments for a specific testimony
router.get('/testimony/:testimonyId', async (req, res) => {
    try {
        const comments = await Comment.findAll({
            where: { 
                testimonyId: req.params.testimonyId,
                status: 'approved'
            },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profilePicture'] }],
            order: [['createdAt', 'ASC']]
        });
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a comment to a post
router.post('/post/:postId', auth, async (req, res) => {
    try {
        const content = stripHtml(req.body.content);
        if (!content || content.length === 0)
            return res.status(400).json({ message: 'Comment cannot be empty.' });
        if (content.length > MAX_COMMENT_LENGTH)
            return res.status(400).json({ message: `Comment too long (max ${MAX_COMMENT_LENGTH} chars).` });

        const post = await CommunityPost.findByPk(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = await Comment.create({
            content,
            userId: req.user.id,
            postId: req.params.postId
        });

        // Increment comment count on post
        await post.increment('commentCount');

        const fullComment = await Comment.findByPk(comment.id, {
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profilePicture'] }]
        });

        res.json(fullComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a comment to a testimony
router.post('/testimony/:testimonyId', auth, async (req, res) => {
    try {
        const content = stripHtml(req.body.content);
        if (!content || content.length === 0)
            return res.status(400).json({ message: 'Comment cannot be empty.' });
        if (content.length > MAX_COMMENT_LENGTH)
            return res.status(400).json({ message: `Comment too long (max ${MAX_COMMENT_LENGTH} chars).` });

        const testimony = await Testimony.findByPk(req.params.testimonyId);
        if (!testimony) return res.status(404).json({ message: 'Testimony not found' });

        const comment = await Comment.create({
            content,
            userId: req.user.id,
            testimonyId: req.params.testimonyId
        });

        const fullComment = await Comment.findByPk(comment.id, {
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profilePicture'] }]
        });

        res.json(fullComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
