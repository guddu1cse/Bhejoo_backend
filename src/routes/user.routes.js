const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const authenticate = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authenticate);

router.get('/profile', UserController.getProfile);
router.get('/orders', UserController.getOrderHistory);
router.get('/orders/:id', UserController.getOrderDetails);

module.exports = router;
