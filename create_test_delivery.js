const pool = require('./src/config/mysql');
const bcrypt = require('bcryptjs');

async function createDeliveryMan() {
    try {
        const name = 'Test Delivery Partner';
        const email = 'delivery@example.com';
        const password = await bcrypt.hash('password123', 10);
        const role = 'Delivery Man';
        const status = 'active';

        // Check if already exists
        const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            console.log('Test delivery man already exists with ID:', existing[0].id);
            process.exit(0);
        }

        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
            [name, email, password, role, status]
        );

        console.log('Successfully created test delivery partner!');
        console.log('Email: delivery@example.com');
        console.log('Password: password123');
        console.log('User ID:', result.insertId);

        process.exit(0);
    } catch (e) {
        console.error('Error creating delivery man:', e);
        process.exit(1);
    }
}

createDeliveryMan();
