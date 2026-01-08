const express = require('express');
const router = express.Router();
const RestaurantController = require('../controllers/restaurant.controller');

// Public routes
router.get('/', RestaurantController.getAllRestaurants);
router.get('/:id', RestaurantController.getRestaurantById);
router.get('/:id/dishes', RestaurantController.getRestaurantDishes);

module.exports = router;
