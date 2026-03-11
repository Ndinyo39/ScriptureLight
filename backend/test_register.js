const { User } = require('./models');
const { connectDB } = require('./config/database');

async function test() {
    await connectDB();
    try {
        console.log('Attempting to create user...');
        const user = await User.create({
            name: 'Test Debug',
            email: 'debug' + Date.now() + '@test.com',
            password: 'password123'
        });
        console.log('Success! User ID:', user.id);
    } catch (error) {
        console.error('FAILED to create user:');
        console.error(error);
    }
    process.exit();
}

test();
