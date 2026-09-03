const orderService = require('../services/orderService');
const NodeCache = require('node-cache');
const { CACHE_TTL_SECONDS } = require('../config/constants');

// In-memory cache for order list responses
const orderCache = new NodeCache({ stdTTL: CACHE_TTL_SECONDS, checkperiod: 30 });

/**
 * POST /api/orders
 * Create a new order. Invalidates the user's order list cache.
 */
const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user.id, req.body);
    // Invalidate cache when a new order is placed
    orderCache.del(`orders:${req.user.id}`);
    res.status(201).json({ success: true, message: 'Order placed successfully.', data: order });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders
 * Get all orders for the authenticated user. Cached for CACHE_TTL_SECONDS.
 */
const getOrders = async (req, res, next) => {
  try {
    const cacheKey = `orders:${req.user.id}`;
    const cached = orderCache.get(cacheKey);

    if (cached) {
      return res.json({ success: true, fromCache: true, count: cached.length, data: cached });
    }

    const orders = await orderService.getOrdersByUser(req.user.id);
    orderCache.set(cacheKey, orders);

    res.json({ success: true, fromCache: false, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/:id
 * Get a specific order by ID.
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/orders/:id/status
 * Update order status (admin only). Invalidates affected user cache.
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required.' });
    const order = await orderService.updateOrderStatus(req.params.id, status, req.user.id, reason);
    // Invalidate the order owner's cache
    orderCache.del(`orders:${order.user.toString()}`);
    res.json({ success: true, message: 'Order status updated.', data: order });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/orders/:id
 * Cancel a pending order. Invalidates cache.
 */
const cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user.id);
    orderCache.del(`orders:${req.user.id}`);
    res.json({ success: true, message: 'Order cancelled successfully.', data: order });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, cancelOrder, orderCache };
