const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CommunityPost = sequelize.define('CommunityPost', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    scripture: {
        type: DataTypes.STRING,
        allowNull: true
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: 'encouragement'
    },
    prayCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    commentCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    groupId: {
        type: DataTypes.UUID,
        allowNull: true
    }
});

module.exports = CommunityPost;
