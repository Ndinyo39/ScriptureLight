require('dotenv').config();
const { User } = require('./models');
const { sequelize } = require('./config/database');

const createAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Remove old admin if it exists with old email
        await User.destroy({ where: { email: 'admin@gmail.com' } });

        const [admin, created] = await User.findOrCreate({
            where: { email: 'douglasndinyo5@gmail.com' },
            defaults: {
                name: 'Douglas Ndinyo',
                password: 'Ndinyo@39',
                role: 'admin',
                status: 'active'
            }
        });

        if (created) {
            console.log('Admin user created successfully.');
        } else {
            console.log('Admin user already exists.');
            // Ensure status is active, role is admin, and password is set correctly
            admin.status = 'active';
            admin.role = 'admin';
            admin.password = 'Ndinyo@39'; // The hook in User model will hash this on save
            await admin.save();
            console.log('Admin user updated to active and password reset.');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err);
        process.exit(1);
    }
};

createAdmin();
