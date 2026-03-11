const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudyPlan = sequelize.define('StudyPlan', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'faith'
    },
    difficulty: {
        type: DataTypes.STRING,
        defaultValue: 'Beginner'
    },
    durationDays: {
        type: DataTypes.INTEGER,
        defaultValue: 30
    },
    color: {
        type: DataTypes.STRING,
        defaultValue: '#4a6fa5'
    },
    content: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    }
});

module.exports = StudyPlan;
