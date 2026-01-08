const express = require('express');
const router = express.Router();
const DishController = require('../controllers/dish.controller');

// Public routes
router.get('/', DishController.getAllDishes);
router.get('/:id', DishController.getDishById);

module.exports = router;
