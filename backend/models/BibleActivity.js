const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BibleActivity = sequelize.define('BibleActivity', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    book: {
        type: DataTypes.STRING,
        allowNull: false
    },
    chapter: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    minutesSpent: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    dateRead: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = BibleActivity;
