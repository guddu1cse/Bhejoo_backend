const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const authenticate = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

// Create order (requires authentication)
router.post('/', authenticate, OrderController.createOrder);

// Get order details (requires authentication)
router.get('/:id', authenticate, OrderController.getOrderDetails);


module.exports = router;
