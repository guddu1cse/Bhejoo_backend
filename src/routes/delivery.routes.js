const express = require('express');
const router = express.Router();
const DeliveryController = require('../controllers/delivery.controller');
const authenticate = require('../middlewares/auth.middleware');
const { isDeliveryMan } = require('../middlewares/role.middleware');

// All routes require delivery man authentication
router.use(authenticate);
router.use(isDeliveryMan);

router.get('/orders', DeliveryController.getAssignedOrders);
router.get('/orders/:id', DeliveryController.getOrderDetails);
router.put('/orders/:id/status', DeliveryController.updateDeliveryStatus);

module.exports = router;
