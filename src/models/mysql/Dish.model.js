const pool = require('../../config/mysql');

class Dish {
  static async create(dishData) {
    const { name, description, price, availability, restaurant_id, image_url, category } = dishData;
    const [result] = await pool.execute(
      'INSERT INTO dishes (name, description, price, availability, restaurant_id, image_url, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description || null, price, availability || 'available', restaurant_id, image_url || null, category || null]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT d.*, r.name as restaurant_name 
       FROM dishes d 
       JOIN restaurants r ON d.restaurant_id = r.id 
       WHERE d.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByRestaurantId(restaurantId) {
    const [rows] = await pool.execute(
      'SELECT * FROM dishes WHERE restaurant_id = ? ORDER BY created_at DESC',
      [restaurantId]
    );
    return rows;
  }

  static async findAvailableByRestaurantId(restaurantId) {
    const [rows] = await pool.execute(
      "SELECT * FROM dishes WHERE restaurant_id = ? AND availability = 'available' ORDER BY name",
      [restaurantId]
    );
    return rows;
  }

  static async findAllAvailable() {
    const [rows] = await pool.execute(
      `SELECT d.*, r.name as restaurant_name, r.location as restaurant_location 
       FROM dishes d 
       JOIN restaurants r ON d.restaurant_id = r.id 
       WHERE d.availability = 'available' AND r.status = 'active'
       ORDER BY d.name`
    );
    return rows;
  }

  static async update(id, dishData) {
    const { name, description, price, availability, image_url, category } = dishData;
    await pool.execute(
      'UPDATE dishes SET name = ?, description = ?, price = ?, availability = ?, image_url = ?, category = ? WHERE id = ?',
      [name, description, price, availability, image_url, category, id]
    );
    return this.findById(id);
  }

  static async updateAvailability(id, availability) {
    await pool.execute('UPDATE dishes SET availability = ? WHERE id = ?', [availability, id]);
    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM dishes WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Dish;
