const pool = require('../../config/mysql');

class Order {
  static async create(orderData) {
    const { user_id, restaurant_id, status, total_amount, payment_method, payment_status, delivery_address, delivery_man_id } = orderData;
    const [result] = await pool.execute(
      'INSERT INTO orders (user_id, restaurant_id, status, total_amount, payment_method, payment_status, delivery_address, delivery_man_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, restaurant_id, status || 'pending', total_amount, payment_method || 'COD', payment_status || 'pending', delivery_address, delivery_man_id || null]
    );
    return result.insertId;
  }

  static async createOrderItem(orderItemData) {
    const { order_id, dish_id, quantity, price } = orderItemData;
    const [result] = await pool.execute(
      'INSERT INTO order_items (order_id, dish_id, quantity, price) VALUES (?, ?, ?, ?)',
      [order_id, dish_id, quantity, price]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT o.*, 
       u.name as user_name, u.email as user_email,
       r.name as restaurant_name, r.location as restaurant_location,
       dm.name as delivery_man_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN restaurants r ON o.restaurant_id = r.id
       LEFT JOIN users dm ON o.delivery_man_id = dm.id
       WHERE o.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findOrderItems(orderId) {
    const [rows] = await pool.execute(
      `SELECT oi.*, d.name as dish_name, d.description as dish_description
       FROM order_items oi
       JOIN dishes d ON oi.dish_id = d.id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    return rows;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT o.*, r.name as restaurant_name
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return rows;
  }

  static async findByRestaurantId(restaurantId) {
    const [rows] = await pool.execute(
      `SELECT o.*, u.name as user_name, u.email as user_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.restaurant_id = ?
       ORDER BY o.created_at DESC`,
      [restaurantId]
    );
    return rows;
  }

  static async findByDeliveryManId(deliveryManId) {
    const [rows] = await pool.execute(
      `SELECT o.*, r.name as restaurant_name, u.name as user_name
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.id
       JOIN users u ON o.user_id = u.id
       WHERE o.delivery_man_id = ?
       ORDER BY o.created_at DESC`,
      [deliveryManId]
    );
    return rows;
  }

  static async updateStatus(id, status) {
    await pool.execute(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
    return this.findById(id);
  }

  static async assignDeliveryMan(id, deliveryManId) {
    await pool.execute(
      "UPDATE orders SET delivery_man_id = ?, status = 'assigned', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [deliveryManId, id]
    );
    return this.findById(id);
  }

  static async getAllActiveDeliveryOrders() {
    const [rows] = await pool.execute(
      "SELECT id, delivery_man_id, updated_at FROM orders WHERE status IN ('assigned', 'picked_up', 'on_the_way') AND delivery_man_id IS NOT NULL"
    );
    return rows;
  }
}

module.exports = Order;
