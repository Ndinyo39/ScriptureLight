const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { BibleActivity, User } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Record chapter reading progress
router.post('/record-progress', auth, async (req, res) => {
    try {
        const { book, chapter, minutesSpent } = req.body;
        
        const activity = await BibleActivity.create({
            userId: req.user.id,
            book,
            chapter,
            minutesSpent: minutesSpent || 5
        });

        res.json({ message: 'Progress recorded successfully', activity });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Get user reading statistics including weekly data
router.get('/stats', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Total stats
        const allActivities = await BibleActivity.findAll({
            where: { userId }
        });

        const totalChapters = allActivities.length;
        const totalMinutes = allActivities.reduce((sum, a) => sum + (a.minutesSpent || 0), 0);
        
        // Weekly chart data (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const weeklyActivities = await BibleActivity.findAll({
            where: {
                userId,
                dateRead: {
                    [Op.gte]: sevenDaysAgo
                }
            },
            attributes: [
                [sequelize.fn('date', sequelize.col('dateRead')), 'day'],
                [sequelize.fn('sum', sequelize.col('minutesSpent')), 'totalMins']
            ],
            group: [sequelize.fn('date', sequelize.col('dateRead'))],
            order: [[sequelize.fn('date', sequelize.col('dateRead')), 'ASC']]
        });

        // Format for Recharts
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const chartData = [];
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = days[d.getDay()];
            
            const dayData = weeklyActivities.find(a => a.dataValues.day === dateStr);
            chartData.push({
                name: dayName,
                mins: dayData ? parseInt(dayData.dataValues.totalMins) : 0,
                fullDate: dateStr
            });
        }

        res.json({
            totalChapters,
            totalMinutes,
            chartData
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
