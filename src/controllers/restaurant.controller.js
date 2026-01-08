const Restaurant = require('../models/mysql/Restaurant.model');
const Dish = require('../models/mysql/Dish.model');

class RestaurantController {
  static async getAllRestaurants(req, res, next) {
    try {
      const restaurants = await Restaurant.findAll();
      res.json({
        success: true,
        data: restaurants
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRestaurantById(req, res, next) {
    try {
      const { id } = req.params;
      const restaurant = await Restaurant.findByIdWithDishesCount(id);

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      res.json({
        success: true,
        data: restaurant
      });
    } catch (error) {
      next(error);
    }
  }

  static async createRestaurant(req, res, next) {
    try {
      const { name, location, description, phone } = req.body;
      const adminId = req.user.id;

      // Create the restaurant
      const restaurantId = await Restaurant.create({
        name,
        location,
        description,
        phone,
        status: 'active'
      });

      // Update the user's mapped_id
      const User = require('../models/mysql/User.model');
      const userData = await User.findById(adminId);
      await User.update(adminId, {
        ...userData,
        mapped_restaurant: restaurantId
      });

      res.status(201).json({
        success: true,
        message: 'Restaurant created and assigned successfully',
        data: { restaurantId }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRestaurantDishes(req, res, next) {
    try {
      const { id } = req.params;
      const dishes = await Dish.findAvailableByRestaurantId(id);

      res.json({
        success: true,
        data: dishes
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RestaurantController;
