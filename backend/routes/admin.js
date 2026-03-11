const express = require('express');
const router = express.Router();
const { User, BibleGroup, Testimony, Comment, CommunityPost, GroupMember, Book } = require('../models');
const { sequelize } = require('../config/database');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Apply auth and admin middleware to all routes in this router
router.use(auth);
router.use(admin);

// ── DASHBOARD STATS ────────────────────────
router.get('/stats', async (req, res) => {
    try {
        const [usersCount, groupsCount] = await Promise.all([
            User.count(),
            BibleGroup.count(),
        ]);
        const testimoniesCount = await Testimony.count();
        const postsCount = await CommunityPost.count();

        const pendingTestimonies = await Testimony.count({ where: { status: 'pending' } });
        const pendingUsers = await User.count({ where: { status: 'pending' } });
        const pendingBooks = await Book.count({ where: { status: 'pending' } });
        
        res.json({
            usersCount,
            groupsCount,
            testimoniesCount,
            postsCount,
            pendingTestimonies,
            pendingUsers,
            pendingBooks
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── BIBLE GROUPS ───────────────────────────
router.get('/groups', async (req, res) => {
    try {
        const groups = await BibleGroup.findAll({
            attributes: {
                include: [
                    [
                        sequelize.literal(`(SELECT COUNT(*) FROM GroupMembers WHERE groupId = BibleGroup.id)`),
                        'membersCount'
                    ]
                ]
            },
            include: [{ model: User, as: 'founder', attributes: ['name', 'email'] }]
        });
        res.json(groups);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/groups/:id', async (req, res) => {
    try {
        const group = await BibleGroup.findByPk(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        
        await group.destroy();
        res.json({ message: 'Group deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── TESTIMONIES ────────────────────────────
router.get('/testimonies', async (req, res) => {
    try {
        const testimonies = await Testimony.findAll({
            include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(testimonies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/testimonies/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const testimony = await Testimony.findByPk(req.params.id);
        if (!testimony) return res.status(404).json({ message: 'Testimony not found' });
        
        testimony.status = status;
        await testimony.save();
        res.json(testimony);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/testimonies/:id', async (req, res) => {
    try {
        const testimony = await Testimony.findByPk(req.params.id);
        if (!testimony) return res.status(404).json({ message: 'Testimony not found' });
        
        await testimony.destroy();
        res.json({ message: 'Testimony deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── COMMENTS ───────────────────────────────
router.get('/comments', async (req, res) => {
    try {
        const comments = await Comment.findAll({
            include: [
                { model: User, as: 'user', attributes: ['name'] },
                { model: Testimony, as: 'testimony', attributes: ['title'] },
                { model: CommunityPost, as: 'post', attributes: ['content'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/comments/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const comment = await Comment.findByPk(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        
        comment.status = status;
        await comment.save();
        res.json(comment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/comments/:id', async (req, res) => {
    try {
        const comment = await Comment.findByPk(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        
        await comment.destroy();
        res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── USERS ──────────────────────────────────
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.role = role;
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/users/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.status = status;
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── BOOKS MANAGEMENT ───────────────────────
router.get('/books', async (req, res) => {
    try {
        const books = await Book.findAll({
            include: [{ model: User, as: 'uploader', attributes: ['name', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/books/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const book = await Book.findByPk(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        
        book.status = status;
        await book.save();
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/books/:id', async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        
        // Delete file from disk
        const path = require('path');
        const fs = require('fs');
        const filePath = path.join(__dirname, '../uploads/books', book.fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await book.destroy();
        res.json({ message: 'Book deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
