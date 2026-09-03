const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { RATE_LIMIT } = require('../config/constants');

// Apply stricter rate limiting to order creation to prevent abuse
const createOrderLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: 10,  // Max 10 order creations per 15 minutes
  message: { success: false, message: 'Too many orders created. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiting for read operations
const readLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  message: { success: false, message: RATE_LIMIT.MESSAGE },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', createOrderLimiter, createOrder);
router.get('/', readLimiter, getOrders);
router.get('/:id', readLimiter, getOrderById);
router.put('/:id/status', readLimiter, updateOrderStatus);
router.delete('/:id', readLimiter, cancelOrder);
const {
  createOrder, getOrders, searchOrders, getOrderById, updateOrderStatus, cancelOrder,
} = require('../controllers/orderController');

// All order routes require authentication
router.post('/', createOrder);
router.get('/search', searchOrders);   // Must be before /:id to avoid conflict
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);
router.delete('/:id', cancelOrder);

module.exports = router;
