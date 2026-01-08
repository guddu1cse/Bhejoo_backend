const Dish = require('../models/mysql/Dish.model');

class DishController {
  static async getAllDishes(req, res, next) {
    try {
      const dishes = await Dish.findAllAvailable();
      res.json({
        success: true,
        data: dishes
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDishById(req, res, next) {
    try {
      const { id } = req.params;
      const dish = await Dish.findById(id);

      if (!dish) {
        return res.status(404).json({
          success: false,
          message: 'Dish not found'
        });
      }

      res.json({
        success: true,
        data: dish
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DishController;
