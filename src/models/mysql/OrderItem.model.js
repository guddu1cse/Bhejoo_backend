const pool = require('../../config/mysql');

class OrderItem {
  static async findByOrderId(orderId) {
    const [rows] = await pool.execute(
      `SELECT oi.*, d.name as dish_name, d.description as dish_description, d.image_url as dish_image
       FROM order_items oi
       JOIN dishes d ON oi.dish_id = d.id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    return rows;
  }

  static async create(orderItemData) {
    const { order_id, dish_id, quantity, price } = orderItemData;
    const [result] = await pool.execute(
      'INSERT INTO order_items (order_id, dish_id, quantity, price) VALUES (?, ?, ?, ?)',
      [order_id, dish_id, quantity, price]
    );
    return result.insertId;
  }
}

module.exports = OrderItem;
