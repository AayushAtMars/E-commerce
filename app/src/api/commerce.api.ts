import { commerceApi } from './client';

export const commerceApiModule = {
  // Cart
  getCart: () => commerceApi.get('/api/cart'),
  addItem: (data: { productId: string; size: string; color: string; quantity: number }) =>
    commerceApi.post('/api/cart/add', data),
  syncCart: (items: unknown[]) => commerceApi.post('/api/cart/sync', { items }),
  updateQuantity: (data: { productId: string; size: string; color: string; quantity: number }) =>
    commerceApi.patch('/api/cart/quantity', data),
  removeItem: (data: { productId: string; size: string; color: string }) =>
    commerceApi.delete('/api/cart/item', { data }),
  clearCart: () => commerceApi.delete('/api/cart'),

  // Orders
  createOrder: (data: {
    shippingAddress: object;
    shippingType: string;
    paymentMethod: string;
    promoCode?: string;
  }) => commerceApi.post('/api/orders', data),

  listOrders: (status?: string) =>
    commerceApi.get('/api/orders', { params: status ? { status } : undefined }),

  getOrder: (id: string) => commerceApi.get(`/api/orders/${id}`),

  cancelOrder: (id: string) => commerceApi.patch(`/api/orders/${id}/cancel`),

  // Phase 4
  getOrderTracking: (id: string) => commerceApi.get(`/api/orders/${id}/tracking`),
  advanceOrderStatus: (id: string) => commerceApi.patch(`/api/orders/${id}/advance`),
  reorder: (id: string) => commerceApi.post(`/api/orders/${id}/reorder`),

  // Wallet (Phase 5)
  getWallet: () => commerceApi.get('/api/wallet'),
  topUpWallet: (amount: number) => commerceApi.post('/api/wallet/topup', { amount }),
  getWalletTransactions: (page = 1) =>
    commerceApi.get('/api/wallet/transactions', { params: { page } }),
};

