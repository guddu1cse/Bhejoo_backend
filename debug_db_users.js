const pool = require('./src/config/mysql');

async function check() {
    try {
        const [users] = await pool.execute("SELECT * FROM users");
        console.log("All users:", JSON.stringify(users, null, 2));

        const [deliveryMen] = await pool.execute("SELECT * FROM users WHERE role = 'Delivery Man'");
        console.log("Delivery Men:", JSON.stringify(deliveryMen, null, 2));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
