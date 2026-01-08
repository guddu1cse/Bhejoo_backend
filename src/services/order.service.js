const Order = require('../models/mysql/Order.model');
const Dish = require('../models/mysql/Dish.model');
const User = require('../models/mysql/User.model');
const NotificationService = require('./notification.service');
const { ORDER_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');

class OrderService {
  static async createOrder(userId, orderData) {
    const { restaurant_id, dishes, delivery_address } = orderData;

    logger.info('Creating order', {
      userId,
      restaurantId: restaurant_id,
      itemsCount: dishes ? dishes.length : 0
    });

    // Validate dishes
    if (!dishes || dishes.length === 0) {
      throw new Error('Order must contain at least one dish');
    }

    // Calculate total amount and validate dishes
    let totalAmount = 0;
    const validatedDishes = [];

    for (const item of dishes) {
      const dish = await Dish.findById(item.dish_id);
      if (!dish) {
        logger.warn('Order creation failed - dish not found', {
          userId,
          restaurantId: restaurant_id,
          dishId: item.dish_id
        });
        throw new Error(`Dish with id ${item.dish_id} not found`);
      }

      if (dish.restaurant_id !== parseInt(restaurant_id)) {
        logger.warn('Order creation failed - dish belongs to another restaurant', {
          userId,
          restaurantId: restaurant_id,
          dishId: dish.id,
          dishRestaurantId: dish.restaurant_id
        });
        throw new Error(`Dish ${dish.id} does not belong to restaurant ${restaurant_id}`);
      }

      if (dish.availability !== 'available') {
        logger.warn('Order creation failed - dish unavailable', {
          userId,
          restaurantId: restaurant_id,
          dishId: dish.id,
          dishName: dish.name
        });
        throw new Error(`Dish ${dish.name} is currently unavailable`);
      }

      const itemTotal = dish.price * item.quantity;
      totalAmount += itemTotal;

      validatedDishes.push({
        dish_id: dish.id,
        quantity: item.quantity,
        price: dish.price
      });
    }

    // Create order
    const orderId = await Order.create({
      user_id: userId,
      restaurant_id,
      status: ORDER_STATUS.PENDING,
      total_amount: totalAmount,
      payment_method: 'COD',
      payment_status: 'pending',
      delivery_address
    });

    // Create order items
    for (const item of validatedDishes) {
      await Order.createOrderItem({
        order_id: orderId,
        dish_id: item.dish_id,
        quantity: item.quantity,
        price: item.price
      });
    }

    // Get restaurant admin
    const adminUsers = await User.findAdminsByRestaurant(restaurant_id);

    // Create notifications
    await NotificationService.createNotification(userId, orderId, ORDER_STATUS.PENDING);

    // Notify restaurant admin
    if (adminUsers && adminUsers.length > 0) {
      for (const admin of adminUsers) {
        await NotificationService.createAdminNotification(admin.id, orderId, ORDER_STATUS.PENDING);
      }
    }

    logger.info('Order created successfully', {
      orderId,
      userId,
      restaurantId: restaurant_id,
      totalAmount
    });

    // Auto-assign delivery man
    try {
      await require('./delivery.service').autoAssignOrder(orderId);
    } catch (e) {
      logger.warn('Failed to auto-assign delivery man', e);
    }

    return await Order.findById(orderId);
  }

  static async updateOrderStatus(orderId, status, userId = null) {
    const order = await Order.findById(orderId);
    if (!order) {
      logger.warn('Update order status failed - order not found', {
        orderId,
        status,
        userId
      });
      throw new Error('Order not found');
    }

    // Validate status transition
    const validStatuses = Object.values(ORDER_STATUS);
    if (!validStatuses.includes(status)) {
      logger.warn('Update order status failed - invalid status', {
        orderId,
        status,
        userId
      });
      throw new Error('Invalid order status');
    }

    // Update order status
    await Order.updateStatus(orderId, status);

    // Create notification for user
    await NotificationService.createNotification(order.user_id, orderId, status);

    // If admin updated status, notify admin
    if (userId && userId !== order.user_id) {
      await NotificationService.createNotification(userId, orderId, status);
    }

    logger.info('Order status updated', {
      orderId,
      status,
      updatedByUserId: userId || order.user_id
    });

    return await Order.findById(orderId);
  }

  static async assignDeliveryMan(orderId, deliveryManId) {
    const order = await Order.findById(orderId);
    if (!order) {
      logger.warn('Assign delivery failed - order not found', {
        orderId,
        deliveryManId
      });
      throw new Error('Order not found');
    }

    // Check if delivery man exists and is active
    const deliveryMan = await User.findById(deliveryManId);
    if (!deliveryMan || deliveryMan.role !== 'Delivery Man') {
      logger.warn('Assign delivery failed - invalid delivery man', {
        orderId,
        deliveryManId
      });
      throw new Error('Invalid delivery man');
    }

    if (deliveryMan.status !== 'active') {
      logger.warn('Assign delivery failed - delivery man inactive', {
        orderId,
        deliveryManId,
        status: deliveryMan.status
      });
      throw new Error('Delivery man is not active');
    }

    // Assign delivery man
    await Order.assignDeliveryMan(orderId, deliveryManId);

    // Create notifications
    await NotificationService.createNotification(order.user_id, orderId, ORDER_STATUS.ASSIGNED);
    await NotificationService.createNotification(deliveryManId, orderId, ORDER_STATUS.ASSIGNED);

    logger.info('Delivery man assigned to order', {
      orderId,
      deliveryManId
    });

    return await Order.findById(orderId);
  }

  static async getOrderDetails(orderId) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const orderItems = await Order.findOrderItems(orderId);

    return {
      ...order,
      dishes: orderItems
    };
  }
}

module.exports = OrderService;
