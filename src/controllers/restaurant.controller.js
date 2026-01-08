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
