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
    prayedBy: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() {
            const rawValue = this.getDataValue('prayedBy');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(val) {
            this.setDataValue('prayedBy', JSON.stringify(val));
        }
    },
    commentCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    viewedBy: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() {
            const rawValue = this.getDataValue('viewedBy');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(val) {
            this.setDataValue('viewedBy', JSON.stringify(val));
        }
    },
    groupId: {
        type: DataTypes.UUID,
        allowNull: true
    }
});

module.exports = CommunityPost;
