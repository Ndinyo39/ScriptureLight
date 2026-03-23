const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Highlight } = require('../models');

// Get all highlights for current user
router.get('/highlights', auth, async (req, res) => {
    try {
        const highlights = await Highlight.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(highlights);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create, Update, or Delete a highlight
router.post('/highlights', auth, async (req, res) => {
    try {
        const { book, chapter, verseNumber, content, color } = req.body;
        
        const where = {
            userId: req.user.id,
            book,
            chapter,
            verseNumber
        };

        if (!color) {
            // Treat missing color as a deletion request
            await Highlight.destroy({ where });
            return res.json({ message: 'Highlight removed' });
        }

        // Find existing highlight for this specific verse
        let highlight = await Highlight.findOne({ where });

        if (highlight) {
            // Update color or content
            highlight.color = color;
            if (content) highlight.content = content;
            await highlight.save();
        } else {
            // Create new
            highlight = await Highlight.create({
                userId: req.user.id,
                book,
                chapter,
                verseNumber,
                content: content || '',
                color
            });
        }

        res.json(highlight);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a highlight
router.delete('/highlights/:id', auth, async (req, res) => {
    try {
        const highlight = await Highlight.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!highlight) {
            return res.status(404).json({ message: 'Highlight not found' });
        }

        await highlight.destroy();
        res.json({ message: 'Highlight removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
