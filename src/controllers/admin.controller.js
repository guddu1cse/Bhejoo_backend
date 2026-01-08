const Dish = require('../models/mysql/Dish.model');
const Order = require('../models/mysql/Order.model');
const Restaurant = require('../models/mysql/Restaurant.model');
const User = require('../models/mysql/User.model');
const OrderService = require('../services/order.service');
const NotificationService = require('../services/notification.service');
const logger = require('../utils/logger');

class AdminController {
  // Create a restaurant and assign it to the current admin user
  static async createAndAssignRestaurant(req, res, next) {
    try {
      const adminUser = req.user;

      if (adminUser.mapped_restaurant) {
        return res.status(400).json({
          success: false,
          message: 'Admin is already mapped to a restaurant'
        });
      }

      const { name, location, description, phone } = req.body;

      if (!name || !location) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant name and location are required'
        });
      }

      const restaurantId = await Restaurant.create({
        name,
        location,
        description,
        phone,
        status: 'active'
      });

      const restaurant = await Restaurant.findById(restaurantId);

      // Map this restaurant to the current admin user
      await User.update(adminUser.id, {
        name: adminUser.name,
        email: adminUser.email,
        status: adminUser.status,
        mapped_restaurant: restaurantId
      });

      logger.info('Restaurant created and assigned to admin', {
        restaurantId,
        adminUserId: adminUser.id
      });

      return res.status(201).json({
        success: true,
        message: 'Restaurant created and assigned to admin successfully',
        data: {
          restaurant,
          admin: {
            id: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            mapped_restaurant: restaurantId
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
  static async getDishes(req, res, next) {
    try {
      const restaurantId = req.user.mapped_restaurant;

      if (!restaurantId) {
        return res.status(400).json({
          success: false,
          message: 'Admin is not mapped to any restaurant'
        });
      }

      const dishes = await Dish.findByRestaurantId(restaurantId);

      res.json({
        success: true,
        data: dishes
      });
    } catch (error) {
      next(error);
    }
  }

  static async createDish(req, res, next) {
    try {
      const restaurantId = req.user.mapped_restaurant;

      if (!restaurantId) {
        return res.status(400).json({
          success: false,
          message: 'Admin is not mapped to any restaurant'
        });
      }

      const { name, description, price, availability, image_url, category } = req.body;

      if (!name || !price) {
        return res.status(400).json({
          success: false,
          message: 'Name and price are required'
        });
      }

      const dishId = await Dish.create({
        name,
        description,
        price,
        availability: availability || 'available',
        restaurant_id: restaurantId,
        image_url,
        category
      });

      const dish = await Dish.findById(dishId);

      res.status(201).json({
        success: true,
        message: 'Dish created successfully',
        data: dish
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateDish(req, res, next) {
    try {
      const restaurantId = req.user.mapped_restaurant;
      const { id } = req.params;

      const dish = await Dish.findById(id);
      if (!dish) {
        return res.status(404).json({
          success: false,
          message: 'Dish not found'
        });
      }

      if (dish.restaurant_id !== restaurantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Dish does not belong to your restaurant'
        });
      }

      const { name, description, price, availability, image_url, category } = req.body;

      const updatedDish = await Dish.update(id, {
        name: name || dish.name,
        description: description !== undefined ? description : dish.description,
        price: price || dish.price,
        availability: availability || dish.availability,
        image_url: image_url !== undefined ? image_url : dish.image_url,
        category: category !== undefined ? category : dish.category
      });

      res.json({
        success: true,
        message: 'Dish updated successfully',
        data: updatedDish
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteDish(req, res, next) {
    try {
      const restaurantId = req.user.mapped_restaurant;
      const { id } = req.params;

      const dish = await Dish.findById(id);
      if (!dish) {
        return res.status(404).json({
          success: false,
          message: 'Dish not found'
        });
      }

      if (dish.restaurant_id !== restaurantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Dish does not belong to your restaurant'
        });
      }

      await Dish.delete(id);

      res.json({
        success: true,
        message: 'Dish deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateDishAvailability(req, res, next) {
    try {
      const restaurantId = req.user.mapped_restaurant;
      const { id } = req.params;
      const { availability } = req.body;

      if (!['available', 'unavailable'].includes(availability)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid availability status'
        });
      }

      const dish = await Dish.findById(id);
      if (!dish) {
        return res.status(404).json({
          success: false,
          message: 'Dish not found'
        });
      }

      if (dish.restaurant_id !== restaurantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Dish does not belong to your restaurant'
        });
      }

      const updatedDish = await Dish.updateAvailability(id, availability);

      res.json({
        success: true,
        message: 'Dish availability updated successfully',
        data: updatedDish
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrders(req, res, next) {
    try {
      const restaurantId = req.user.mapped_restaurant;

      if (!restaurantId) {
        return res.status(400).json({
          success: false,
          message: 'Admin is not mapped to any restaurant'
        });
      }

      const orders = await Order.findByRestaurantId(restaurantId);

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

  static async updateOrderStatus(req, res, next) {
    try {
      const restaurantId = req.user.mapped_restaurant;
      const { id } = req.params;
      const { status } = req.body;

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.restaurant_id !== restaurantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Order does not belong to your restaurant'
        });
      }

      const updatedOrder = await OrderService.updateOrderStatus(id, status, req.user.id);

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: updatedOrder
      });
    } catch (error) {
      next(error);
    }
  }

  static async getNotifications(req, res, next) {
    try {
      const notifications = await NotificationService.getUserNotifications(req.user.id);
      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
