const DeliveryService = require('../services/delivery.service');
const Order = require('../models/mysql/Order.model');

class DeliveryController {
  static async getAssignedOrders(req, res, next) {
    try {
      const fs = require('fs');
      const logData = `\n[${new Date().toISOString()}] Req User: ${JSON.stringify(req.user)} | ID: ${req.user?.id} | Role: ${req.user?.role}`;
      fs.appendFileSync('debug_logs.txt', logData);

      console.log('DeliveryController.getAssignedOrders called for user:', req.user.id, req.user.role);
      const orders = await DeliveryService.getDeliveryManOrders(req.user.id);

      fs.appendFileSync('debug_logs.txt', `\n[${new Date().toISOString()}] Orders Found: ${orders.length}`);
      console.log('DeliveryService returned orders count:', orders.length);

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

  static async updateDeliveryStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const order = await DeliveryService.updateDeliveryStatus(id, status, req.user.id);

      res.json({
        success: true,
        message: 'Delivery status updated successfully',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderDetails(req, res, next) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.delivery_man_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. This order is not assigned to you'
        });
      }

      const orderItems = await Order.findOrderItems(id);

      res.json({
        success: true,
        data: {
          ...order,
          dishes: orderItems
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DeliveryController;
