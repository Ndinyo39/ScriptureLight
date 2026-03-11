const { Book, User } = require('./models');
const { sequelize } = require('./config/database');

const seedBooks = async () => {
    try {
        await sequelize.sync();
        
        const admin = await User.findOne({ where: { role: 'admin' } });
        if (!admin) {
            console.log('Admin user not found. Please create one first.');
            return;
        }

        const booksData = [
            {
                title: 'The Purpose Driven Life',
                author: 'Rick Warren',
                description: 'A far-reaching guide to spiritual meaning and discovery, helping you understand why you are alive and God\'s amazing plan for you.',
                category: 'devotional',
                fileName: 'purpose_driven_life.pdf',
                originalName: 'The Purpose Driven Life.pdf',
                fileSize: 1024000,
                coverColor: '#4a6fa5',
                status: 'approved',
                uploaderId: admin.id
            },
            {
                title: 'Mere Christianity',
                author: 'C.S. Lewis',
                description: 'A classic of Christian apologetics, exploring the common ground upon which all those of Christian faith stand together.',
                category: 'theology',
                fileName: 'mere_christianity.pdf',
                originalName: 'Mere Christianity.pdf',
                fileSize: 2048000,
                coverColor: '#2a9d8f',
                status: 'approved',
                uploaderId: admin.id
            },
            {
                title: 'Knowledge of the Holy',
                author: 'A.W. Tozer',
                description: 'Classic exploration of the attributes of God, emphasizing the importance of a right concept of God in our spiritual life.',
                category: 'theology',
                fileName: 'knowledge_of_the_holy.pdf',
                originalName: 'Knowledge of the Holy.pdf',
                fileSize: 1536000,
                coverColor: '#e76f51',
                status: 'approved',
                uploaderId: admin.id
            },
            {
                title: 'Crazy Love',
                author: 'Francis Chan',
                description: 'An invitation to a radical, relentless love for God that changes everything about how we live our lives.',
                category: 'leadership',
                fileName: 'crazy_love.pdf',
                originalName: 'Crazy Love.pdf',
                fileSize: 1280000,
                coverColor: '#f4a261',
                status: 'approved',
                uploaderId: admin.id
            }
        ];

        for (const book of booksData) {
            const exists = await Book.findOne({ where: { title: book.title } });
            if (!exists) {
                await Book.create(book);
                console.log(`Created book: ${book.title}`);
            }
        }

        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedBooks();
