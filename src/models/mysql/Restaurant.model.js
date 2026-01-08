const pool = require('../../config/mysql');

class Restaurant {
  static async create(restaurantData) {
    const { name, location, description, phone, status } = restaurantData;
    const [result] = await pool.execute(
      'INSERT INTO restaurants (name, location, description, phone, status) VALUES (?, ?, ?, ?, ?)',
      [name, location, description || null, phone || null, status || 'active']
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM restaurants WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await pool.execute("SELECT * FROM restaurants WHERE status = 'active'");
    return rows;
  }

  static async findByIdWithDishesCount(id) {
    const [rows] = await pool.execute(
      `SELECT r.*, COUNT(d.id) as dishes_count 
       FROM restaurants r 
       LEFT JOIN dishes d ON r.id = d.restaurant_id AND d.availability = 'available'
       WHERE r.id = ? 
       GROUP BY r.id`,
      [id]
    );
    return rows[0] || null;
  }

  static async update(id, restaurantData) {
    const { name, location, description, phone, status } = restaurantData;
    await pool.execute(
      'UPDATE restaurants SET name = ?, location = ?, description = ?, phone = ?, status = ? WHERE id = ?',
      [name, location, description, phone, status, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute("UPDATE restaurants SET status = 'inactive' WHERE id = ?", [id]);
    return true;
  }
}

module.exports = Restaurant;
