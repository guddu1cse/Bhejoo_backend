const pool = require('../../config/mysql');

class User {
  static async create(userData) {
    const { name, email, password, role, status, mapped_restaurant } = userData;
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role, status, mapped_restaurant) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, role || 'user', status || 'active', mapped_restaurant || null]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findByIdWithRestaurant(id) {
    const [rows] = await pool.execute(
      `SELECT u.*, r.name as restaurant_name, r.location as restaurant_location 
       FROM users u 
       LEFT JOIN restaurants r ON u.mapped_restaurant = r.id 
       WHERE u.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async update(id, userData) {
    const { name, email, status, mapped_restaurant } = userData;
    await pool.execute(
      'UPDATE users SET name = ?, email = ?, status = ?, mapped_restaurant = ? WHERE id = ?',
      [name, email, status, mapped_restaurant, id]
    );
    return this.findById(id);
  }

  static async getAllDeliveryMen() {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE role = 'Delivery Man' AND status = 'active'"
    );
    return rows;
  }

  static async findAdminsByRestaurant(restaurantId) {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE role = 'admin' AND mapped_restaurant = ? AND status = 'active'",
      [restaurantId]
    );
    return rows;
  }
}

module.exports = User;
