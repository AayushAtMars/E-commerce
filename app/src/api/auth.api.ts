import { catalogApi } from './client';

export const authApi = {
  signup: (data: { name: string; email: string; password: string }) =>
    catalogApi.post('/api/auth/signup', data),

  login: (data: { email: string; password: string }) =>
    catalogApi.post('/api/auth/login', data),

  verifyOtp: (data: { email: string; code: string; purpose: 'signup' | 'forgotPassword' }) =>
    catalogApi.post('/api/auth/verify-otp', data),

  resendOtp: (data: { email: string; purpose: 'signup' | 'forgotPassword' }) =>
    catalogApi.post('/api/auth/resend-otp', data),

  forgotPassword: (email: string) =>
    catalogApi.post('/api/auth/forgot-password', { email }),

  resetPassword: (data: { email: string; code: string; newPassword: string }) =>
    catalogApi.post('/api/auth/reset-password', data),

  refreshToken: (refreshToken: string) =>
    catalogApi.post('/api/auth/refresh-token', { refreshToken }),

  getMe: () => catalogApi.get('/api/auth/me'),

  completeProfile: (data: {
    name?: string;
    phone?: string;
    gender?: string;
    dob?: string;
    avatarUrl?: string;
  }) => catalogApi.patch('/api/auth/complete-profile', data),
};
