const orderService = require('../src/services/orderService');
const Order = require('../src/models/order');
const Product = require('../src/models/product');
const User = require('../src/models/user');

jest.mock('../src/models/order');
jest.mock('../src/models/product');
jest.mock('../src/models/user');

describe('orderService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('calculateSubtotal()', () => {
    it('should correctly sum item prices', () => {
      const items = [{ unitPrice: 10.00, quantity: 2 }, { unitPrice: 5.50, quantity: 3 }];
      expect(orderService.calculateSubtotal(items)).toBe(36.50);
    });

    it('should return 0 for an empty item list', () => {
      expect(orderService.calculateSubtotal([])).toBe(0);
    });
  });

  describe('cancelOrder()', () => {
    it('should throw 422 if order is not in pending state', async () => {
      const mockOrder = { user: { toString: () => 'user123' }, status: 'shipped', items: [] };
      Order.findById.mockResolvedValue(mockOrder);
      await expect(orderService.cancelOrder('order123', 'user123')).rejects.toMatchObject({ statusCode: 422 });
    });

    it('should throw 403 if user does not own the order', async () => {
      const mockOrder = { user: { toString: () => 'otherUser' }, status: 'pending' };
      Order.findById.mockResolvedValue(mockOrder);
      await expect(orderService.cancelOrder('order123', 'user123')).rejects.toMatchObject({ statusCode: 403 });
    });
  });
});
