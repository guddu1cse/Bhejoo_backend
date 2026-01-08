const mongoose = require('mongoose');
const mongoConnection = require('../../config/mongo');

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  order_id: {
    type: Number,
    default: null
  },
  type: {
    type: String,
    enum: ['order_placed', 'order_confirmed', 'order_preparing', 'order_packed', 'order_assigned', 'order_picked_up', 'order_on_the_way', 'order_delivered', 'order_cancelled'],
    default: 'order_placed'
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ user_id: 1, createdAt: -1 });
notificationSchema.index({ user_id: 1, read: 1 });

const Notification = mongoConnection.model('Notification', notificationSchema);

module.exports = Notification;
