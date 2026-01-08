const express = require('express');
const router = express.Router();
const NotificationService = require('../services/notification.service');
const authenticate = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const notifications = await NotificationService.getUserNotifications(req.user.id);
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    await NotificationService.markAsRead(req.params.id, req.user.id);
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    await NotificationService.markAllAsRead(req.user.id);
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
