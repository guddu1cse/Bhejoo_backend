const pool = require('../../config/mysql');

class DeliveryAssignment {
  static async create(assignmentData) {
    const { order_id, delivery_man_id, status } = assignmentData;
    const [result] = await pool.execute(
      'INSERT INTO delivery_assignments (order_id, delivery_man_id, status) VALUES (?, ?, ?)',
      [order_id, delivery_man_id, status || 'assigned']
    );
    return result.insertId;
  }

  static async findByDeliveryManId(deliveryManId) {
    const [rows] = await pool.execute(
      `SELECT da.*, o.*, r.name as restaurant_name, u.name as user_name, u.email as user_email
       FROM delivery_assignments da
       JOIN orders o ON da.order_id = o.id
       JOIN restaurants r ON o.restaurant_id = r.id
       JOIN users u ON o.user_id = u.id
       WHERE da.delivery_man_id = ?
       ORDER BY da.assigned_at DESC`,
      [deliveryManId]
    );
    return rows;
  }

  static async updateStatus(orderId, status) {
    await pool.execute(
      'UPDATE delivery_assignments SET status = ? WHERE order_id = ?',
      [status, orderId]
    );
    return true;
  }
}

module.exports = DeliveryAssignment;
