const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Highlight = sequelize.define('Highlight', {
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
    verseNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    color: {
        type: DataTypes.STRING,
        defaultValue: 'yellow'
    }
});

module.exports = Highlight;
