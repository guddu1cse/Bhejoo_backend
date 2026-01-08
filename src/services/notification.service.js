const Notification = require('../models/mongo/Notification.model');
const { ORDER_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');

class NotificationService {
  static getNotificationTypeFromStatus(status) {
    const statusMap = {
      'pending': 'order_placed',
      'confirmed': 'order_confirmed',
      'preparing': 'order_preparing',
      'packed': 'order_packed',
      'assigned': 'order_assigned',
      'picked_up': 'order_picked_up',
      'on_the_way': 'order_on_the_way',
      'delivered': 'order_delivered',
      'cancelled': 'order_cancelled'
    };
    return statusMap[status] || 'order_placed';
  }

  static getNotificationTitle(status) {
    const titleMap = {
      'pending': 'Order Placed',
      'confirmed': 'Order Confirmed',
      'preparing': 'Order Being Prepared',
      'packed': 'Order Packed',
      'assigned': 'Order Assigned to Delivery',
      'picked_up': 'Order Picked Up',
      'on_the_way': 'Order On The Way',
      'delivered': 'Order Delivered',
      'cancelled': 'Order Cancelled'
    };
    return titleMap[status] || 'Order Status Updated';
  }

  static getNotificationDescription(status, orderId) {
    const descMap = {
      'pending': `Your order #${orderId} has been placed successfully.`,
      'confirmed': `Restaurant has confirmed your order #${orderId}.`,
      'preparing': `Your order #${orderId} is being prepared.`,
      'packed': `Your order #${orderId} has been packed and ready for pickup.`,
      'assigned': `Your order #${orderId} has been assigned to a delivery person.`,
      'picked_up': `Your order #${orderId} has been picked up from the restaurant.`,
      'on_the_way': `Your order #${orderId} is on the way to your location.`,
      'delivered': `Your order #${orderId} has been delivered successfully.`,
      'cancelled': `Your order #${orderId} has been cancelled.`
    };
    return descMap[status] || `Order #${orderId} status updated to ${status}.`;
  }

  static async createNotification(userId, orderId, status) {
    try {
      const notification = new Notification({
        user_id: userId,
        title: this.getNotificationTitle(status),
        description: this.getNotificationDescription(status, orderId),
        order_id: orderId,
        type: this.getNotificationTypeFromStatus(status),
        read: false
      });

      const saved = await notification.save();
      logger.debug('Notification created', {
        userId,
        orderId,
        status,
        notificationId: saved._id
      });
      return saved;
    } catch (error) {
      logger.error('Error creating notification', error);
      throw error;
    }
  }

  static async createAdminNotification(adminId, orderId, status) {
    try {
      const notification = new Notification({
        user_id: adminId,
        title: `New Order #${orderId}`,
        description: `A new order #${orderId} has been placed for your restaurant. Status: ${status}`,
        order_id: orderId,
        type: 'order_placed',
        read: false
      });

      const saved = await notification.save();
      logger.debug('Admin notification created', {
        adminId,
        orderId,
        status,
        notificationId: saved._id
      });
      return saved;
    } catch (error) {
      logger.error('Error creating admin notification', error);
      throw error;
    }
  }

  static async getUserNotifications(userId, limit = 50) {
    try {
      const notif = await Notification.find({ user_id: userId })
        .sort({ createdAt: -1 })
        .limit(limit);

      logger.debug('Fetched user notifications', {
        userId,
        count: notif.length
      });

      return notif;
    } catch (error) {
      logger.error('Error fetching notifications', error);
      throw error;
    }
  }

  static async markAsRead(notificationId, userId) {
    try {
      const result = await Notification.updateOne(
        { _id: notificationId, user_id: userId },
        { read: true }
      );

      logger.debug('Notification marked as read', {
        notificationId,
        userId,
        modifiedCount: result.modifiedCount
      });

      return result;
    } catch (error) {
      logger.error('Error marking notification as read', error);
      throw error;
    }
  }

  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { user_id: userId, read: false },
        { read: true }
      );

      logger.debug('All notifications marked as read for user', {
        userId,
        modifiedCount: result.modifiedCount
      });

      return result;
    } catch (error) {
      logger.error('Error marking all notifications as read', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
