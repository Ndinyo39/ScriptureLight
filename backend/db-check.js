require('dotenv').config();
const { User } = require('./models');
const { sequelize, connectDB } = require('./config/database');

async function check() {
    try {
        await connectDB();
        const dialect = sequelize.getDialect();
        const count = await User.count();
        const users = await User.findAll({ attributes: ['name', 'email', 'role', 'status'] });
        
        console.log('--- DATABASE DIAGNOSTIC ---');
        console.log(`Dialect: ${dialect}`);
        console.log(`Total Users: ${count}`);
        console.log('Users detail:');
        users.forEach(u => console.log(`- ${u.name} (${u.email}) [Role: ${u.role}, Status: ${u.status}]`));
        console.log('---------------------------');
        process.exit(0);
    } catch (err) {
        console.error('Diagnostic failed:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

check();
