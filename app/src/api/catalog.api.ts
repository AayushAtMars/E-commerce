import { catalogApi } from './client';

export const catalogApiModule = {
  // Products
  getProducts: (params?: {
    category?: string; minPrice?: number; maxPrice?: number; minRating?: number;
    sizes?: string; colors?: string; sort?: string; page?: number; limit?: number;
  }) => catalogApi.get('/api/products', { params }),

  searchProducts: (q: string, page = 1) =>
    catalogApi.get('/api/products/search', { params: { q, page } }),

  getFeatured: () => catalogApi.get('/api/products/featured'),

  getCategories: () => catalogApi.get('/api/products/categories'),

  getProduct: (id: string) => catalogApi.get(`/api/products/${id}`),

  // Wishlist
  getWishlist: () => catalogApi.get('/api/wishlist'),

  addToWishlist: (productId: string) => catalogApi.post(`/api/wishlist/${productId}`),

  removeFromWishlist: (productId: string) => catalogApi.delete(`/api/wishlist/${productId}`),

  // Upload
  uploadFiles: (formData: FormData) => 
    catalogApi.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Reviews
  getReviews: (productId: string, page = 1) =>
    catalogApi.get(`/api/products/${productId}/reviews`, { params: { page } }),

  createReview: (productId: string, data: {
    userName: string; rating: number; text: string; photos?: string[];
  }) => catalogApi.post(`/api/products/${productId}/reviews`, data),

  uploadMedia: (files: Array<{ uri: string; name: string; type: string }>) => {
    const form = new FormData();
    files.forEach((f) => {
      form.append('files', { uri: f.uri, name: f.name, type: f.type } as any);
    });
    return catalogApi.post<{ success: boolean; urls: string[] }>('/api/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Addresses
  getAddresses: () => catalogApi.get('/api/addresses'),

  createAddress: (data: {
    label: string; line1: string; floor?: string; landmark?: string;
    city: string; state: string; pincode: string; isDefault?: boolean;
  }) => catalogApi.post('/api/addresses', data),

  updateAddress: (id: string, data: Partial<{
    label: string; line1: string; floor: string; city: string; state: string; pincode: string; isDefault: boolean;
  }>) => catalogApi.put(`/api/addresses/${id}`, data),

  deleteAddress: (id: string) => catalogApi.delete(`/api/addresses/${id}`),

  setDefaultAddress: (id: string) => catalogApi.patch(`/api/addresses/${id}/default`),

  // Profile (Phase 5)
  updateProfile: (data: {
    name?: string; phone?: string; dob?: string;
    gender?: 'Male' | 'Female' | 'Other'; avatarUrl?: string;
  }) => catalogApi.patch('/api/profile/me', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    catalogApi.patch('/api/profile/me/password', data),

  deleteAccount: (data: { password: string }) =>
    catalogApi.delete('/api/profile/me', { data }),

  updateNotificationPrefs: (prefs: {
    orderUpdates?: boolean; promotions?: boolean; newArrivals?: boolean;
  }) => catalogApi.patch('/api/profile/me/notifications', prefs),

  // Coupons (Phase 5)
  listCoupons: () => catalogApi.get('/api/coupons'),

  validateCoupon: (data: { code: string; subtotal: number }) =>
    catalogApi.post('/api/coupons/validate', data),

  seedCoupons: () => catalogApi.post('/api/coupons/seed'),
};

