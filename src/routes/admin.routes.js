const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const authenticate = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

// Restaurant management (create + assign to current admin)
router.post('/restaurant', AdminController.createAndAssignRestaurant);

// Dish management
router.get('/dishes', AdminController.getDishes);
router.post('/dishes', AdminController.createDish);
router.put('/dishes/:id', AdminController.updateDish);
router.delete('/dishes/:id', AdminController.deleteDish);
router.patch('/dishes/:id/availability', AdminController.updateDishAvailability);

// Order management
router.get('/orders', AdminController.getOrders);
router.put('/orders/:id/status', AdminController.updateOrderStatus);

// Delivery assignment (requires order controller)
const OrderController = require('../controllers/order.controller');
// Assign delivery man (admin only)
router.post('/orders/:id/assign-delivery', OrderController.assignDeliveryMan);
router.post('/orders/:id/auto-assign-delivery', OrderController.autoAssignDelivery);

// Notifications
router.get('/notifications', AdminController.getNotifications);

module.exports = router;
