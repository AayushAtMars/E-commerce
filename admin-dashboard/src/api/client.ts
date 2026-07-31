import axios from 'axios';

const CATALOG_BASE = import.meta.env.VITE_CATALOG_API_URL || 'https://identity-catalog-service.onrender.com/api';
const ORDER_BASE = import.meta.env.VITE_ORDER_API_URL || 'https://commerce-order-service.onrender.com/api';

export const catalogApi = axios.create({ baseURL: CATALOG_BASE });
export const orderApi = axios.create({ baseURL: ORDER_BASE });

// Attach admin JWT token to every request
const attachAdminToken = (config: any) => {
  const token = localStorage.getItem('adminToken');
  if (token && config.headers && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
};

// On 401, clear auth and redirect to login
const handle401 = (error: any) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminIsAuthenticated');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
};

catalogApi.interceptors.request.use(attachAdminToken);
orderApi.interceptors.request.use(attachAdminToken);

catalogApi.interceptors.response.use((r) => r, handle401);
orderApi.interceptors.response.use((r) => r, handle401);
