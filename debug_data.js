const mysql = require('mysql2/promise');
const env = require('./src/config/environment');

const dbConfig = {
    host: env.MYSQL.host,
    port: env.MYSQL.port,
    user: env.MYSQL.user,
    password: env.MYSQL.password,
    database: env.MYSQL.database,
};

async function checkData() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        // Check Delivery Men
        const [deliveryMen] = await connection.execute("SELECT id, name, email, role, status FROM users");
        console.log('--- ALL USERS ---');
        console.table(deliveryMen);

        // Check specific order status
        const [orders] = await connection.execute("SELECT id, user_id, status, delivery_man_id, created_at FROM orders WHERE id = 4");
        console.log('--- Order #4 Status ---');
        console.table(orders);

        // Check what findByDeliveryManId would return
        const [dmOrders] = await connection.execute(
            `SELECT o.*, r.name as restaurant_name, u.name as user_name
              FROM orders o
              JOIN restaurants r ON o.restaurant_id = r.id
              JOIN users u ON o.user_id = u.id
              WHERE o.delivery_man_id = 4
              ORDER BY o.created_at DESC`
        );
        console.log('--- Orders for DM #4 ---');
        // Console table might be too wide, just log IDs and statuses
        console.table(dmOrders.map(o => ({ id: o.id, status: o.status, dm: o.delivery_man_id })));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }

    // TEST SERVICE LOGIC
    try {
        console.log('--- TESTING SERVICE LOGIC ---');
        const DeliveryService = require('./src/services/delivery.service');
        const orders = await DeliveryService.getDeliveryManOrders(4);
        console.log('Service returned count:', orders.length);
        console.table(orders.map(o => ({ id: o.id, status: o.status })));

        // We need to close the pool created by the app check
        // The service uses the pool from config/mysql.js
        // We can try to close it if exported?
        // Usually process.exit() handles it.
    } catch (e) {
        console.error('Service Error:', e);
    }
}

checkData();
