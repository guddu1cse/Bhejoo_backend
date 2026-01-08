const OrderService = require('../services/order.service');
const DeliveryService = require('../services/delivery.service');

class OrderController {
  static async createOrder(req, res, next) {
    try {
      const { restaurant_id, dishes, delivery_address } = req.body;

      if (!restaurant_id || !dishes || !delivery_address) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant ID, dishes, and delivery address are required'
        });
      }

      const order = await OrderService.createOrder(req.user.id, {
        restaurant_id,
        dishes,
        delivery_address
      });

      const orderItems = await require('../models/mysql/Order.model').findOrderItems(order.id);

      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: {
          ...order,
          dishes: orderItems
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderDetails(req, res, next) {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrderDetails(id);

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  static async assignDeliveryMan(req, res, next) {
    try {
      const { id } = req.params;
      const { delivery_man_id } = req.body;

      if (!delivery_man_id) {
        return res.status(400).json({
          success: false,
          message: 'Delivery man ID is required'
        });
      }

      const order = await DeliveryService.assignOrderToDeliveryMan(id, delivery_man_id);

      res.json({
        success: true,
        message: 'Delivery man assigned successfully',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  static async autoAssignDelivery(req, res, next) {
    try {
      const { id } = req.params;
      const order = await DeliveryService.autoAssignOrder(id);

      res.json({
        success: true,
        message: 'Delivery man assigned automatically',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OrderController;
