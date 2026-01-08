const Order = require('../models/mysql/Order.model');
const User = require('../models/mysql/User.model');
const NotificationService = require('./notification.service');
const { ORDER_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');

class DeliveryService {
  static async assignOrderToDeliveryMan(orderId, deliveryManId) {
    const order = await Order.findById(orderId);
    if (!order) {
      logger.warn('AssignOrderToDeliveryMan failed - order not found', {
        orderId,
        deliveryManId
      });
      throw new Error('Order not found');
    }

    if (order.status !== ORDER_STATUS.PACKED) {
      logger.warn('AssignOrderToDeliveryMan failed - order not packed', {
        orderId,
        currentStatus: order.status
      });
      throw new Error('Order must be packed before assigning to delivery');
    }

    const deliveryMan = await User.findById(deliveryManId);
    if (!deliveryMan || deliveryMan.role !== 'Delivery Man') {
      logger.warn('AssignOrderToDeliveryMan failed - invalid delivery man', {
        orderId,
        deliveryManId
      });
      throw new Error('Invalid delivery man');
    }

    // Assign delivery man
    await Order.assignDeliveryMan(orderId, deliveryManId);

    // Create notifications
    await NotificationService.createNotification(order.user_id, orderId, ORDER_STATUS.ASSIGNED);
    await NotificationService.createNotification(deliveryManId, orderId, ORDER_STATUS.ASSIGNED);

    logger.info('Delivery man assigned (delivery service)', {
      orderId,
      deliveryManId
    });

    return await Order.findById(orderId);
  }

  static async updateDeliveryStatus(orderId, status, deliveryManId) {
    const order = await Order.findById(orderId);
    if (!order) {
      logger.warn('UpdateDeliveryStatus failed - order not found', {
        orderId,
        status,
        deliveryManId
      });
      throw new Error('Order not found');
    }

    if (order.delivery_man_id !== deliveryManId) {
      logger.warn('UpdateDeliveryStatus failed - order not assigned to this delivery man', {
        orderId,
        status,
        deliveryManId,
        assignedDeliveryManId: order.delivery_man_id
      });
      throw new Error('This order is not assigned to you');
    }

    // Validate status transitions
    const validStatuses = [ORDER_STATUS.PICKED_UP, ORDER_STATUS.ON_THE_WAY, ORDER_STATUS.DELIVERED];
    if (!validStatuses.includes(status)) {
      logger.warn('UpdateDeliveryStatus failed - invalid status', {
        orderId,
        status,
        deliveryManId
      });
      throw new Error('Invalid delivery status');
    }

    // Update order status
    await Order.updateStatus(orderId, status);

    // Create notification
    // Create notification
    await NotificationService.createNotification(order.user_id, orderId, status);
    await NotificationService.createNotification(deliveryManId, orderId, status);

    // Notify Admin when delivered
    if (status === ORDER_STATUS.DELIVERED) {
      const adminUsers = await User.findAdminsByRestaurant(order.restaurant_id);
      if (adminUsers && adminUsers.length > 0) {
        for (const admin of adminUsers) {
          await NotificationService.createAdminNotification(admin.id, orderId, status);
        }
      }
    }

    logger.info('Delivery status updated', {
      orderId,
      status,
      deliveryManId
    });

    return await Order.findById(orderId);
  }

  static async getDeliveryManOrders(deliveryManId) {
    logger.debug('Fetching delivery man orders', { deliveryManId });
    const rows = await Order.findByDeliveryManId(deliveryManId);
    console.log('Order.findByDeliveryManId raw rows:', rows.length);
    return rows;
  }

  static async autoAssignOrder(orderId) {
    // Get all active delivery men
    const deliveryMen = await User.getAllDeliveryMen();

    if (deliveryMen.length === 0) {
      logger.warn('AutoAssignOrder failed - no delivery men available', {
        orderId
      });
      // Do not throw, just return null so order creation doesn't fail
      return null;
    }

    // Get all active orders to calculate load
    const activeOrders = await Order.getAllActiveDeliveryOrders();

    // Map delivery men to their next free time
    const deliveryMenLoad = deliveryMen.map(dm => {
      let nextFreeTime = Date.now();

      // Find orders for this delivery man
      const myOrders = activeOrders.filter(o => o.delivery_man_id === dm.id);

      myOrders.forEach(o => {
        // Assuming each order takes 30 mins from last update
        const busyUntil = new Date(o.updated_at).getTime() + (30 * 60 * 1000);
        if (busyUntil > nextFreeTime) {
          nextFreeTime = busyUntil;
        }
      });

      return {
        ...dm,
        nextFreeTime
      };
    });

    // Sort by earliest free time
    deliveryMenLoad.sort((a, b) => a.nextFreeTime - b.nextFreeTime);

    const selectedDeliveryMan = deliveryMenLoad[0];

    logger.info('Auto assigning order to delivery man', {
      orderId,
      deliveryManId: selectedDeliveryMan.id,
      nextFreeTime: new Date(selectedDeliveryMan.nextFreeTime).toISOString()
    });

    // We assign but DO NOT change status to 'assigned' if it's currently 'pending' or 'confirmed'
    // Actually, assignOrderToDeliveryMan updates status to 'assigned'.
    // User requested: "auto assigned ... when user placed the order".
    // If we want to keep status flow, we should perhaps just set the ID.
    // However, existing method assignOrderToDeliveryMan enforces 'PACKED' status check!
    // I need to BYPASS that check for initial auto-assignment.

    // Direct update to DB to set delivery_man_id without changing status if not packed
    await require('../config/mysql').execute(
      'UPDATE orders SET delivery_man_id = ? WHERE id = ?',
      [selectedDeliveryMan.id, orderId]
    );

    // Notify Delivery Man
    await NotificationService.createNotification(selectedDeliveryMan.id, orderId, 'assigned'); // Using 'assigned' as notification type even if status is pending

    return selectedDeliveryMan;
  }
}

module.exports = DeliveryService;
