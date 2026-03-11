const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Testimony, User } = require('../models');

// Get all testimonies
router.get('/', async (req, res) => {
    try {
        const testimonies = await Testimony.findAll({
            where: { status: 'approved' },
            order: [['createdAt', 'DESC']],
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'profilePicture', 'bio']
            }]
        });
        res.json(testimonies);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Create new testimony
router.post('/', auth, async (req, res) => {
    try {
        const { title, content, category, scripture } = req.body;
        const testimony = await Testimony.create({
            userId: req.user.id,
            title,
            content,
            category,
            scripture
        });
        
        const fullTestimony = await Testimony.findByPk(testimony.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'profilePicture', 'bio']
            }]
        });
        
        res.json(fullTestimony);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Amen (Pray) for a testimony (increment amenCount)
router.post('/:id/amen', auth, async (req, res) => {
    try {
        const testimony = await Testimony.findByPk(req.params.id);
        if (!testimony) return res.status(404).json({ message: 'Testimony not found' });
        
        await testimony.increment('amenCount');
        const updatedTestimony = await Testimony.findByPk(testimony.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'profilePicture', 'bio']
            }]
        });
        res.json(updatedTestimony);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
