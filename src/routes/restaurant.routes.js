const express = require('express');
const router = express.Router();
const RestaurantController = require('../controllers/restaurant.controller');
const auth = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

// Public routes
router.get('/', RestaurantController.getAllRestaurants);
router.get('/:id', RestaurantController.getRestaurantById);
router.get('/:id/dishes', RestaurantController.getRestaurantDishes);

// Admin-only routes
router.post('/', auth, isAdmin, RestaurantController.createRestaurant);

module.exports = router;
