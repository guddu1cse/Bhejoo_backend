const User = require('../models/mysql/User.model');
const Order = require('../models/mysql/Order.model');
const OrderService = require('../services/order.service');

class UserController {
  static async getProfile(req, res, next) {
    try {
      const user = await User.findByIdWithRestaurant(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Remove password from response
      const { password, ...userData } = user;

      res.json({
        success: true,
        data: userData
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderHistory(req, res, next) {
    try {
      const orders = await Order.findByUserId(req.user.id);
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await Order.findOrderItems(order.id);
          return {
            ...order,
            dishes: items
          };
        })
      );

      res.json({
        success: true,
        data: ordersWithItems
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderDetails(req, res, next) {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrderDetails(id);

      // Check if order belongs to user
      if (order.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
