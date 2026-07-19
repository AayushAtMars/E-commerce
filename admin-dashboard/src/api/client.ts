import axios from 'axios';

// Using env variables if provided, otherwise fallback to deployed production endpoints
export const catalogApi = axios.create({
  baseURL: import.meta.env.VITE_CATALOG_API_URL || 'https://identity-catalog-service.onrender.com/api',
});

export const orderApi = axios.create({
  baseURL: import.meta.env.VITE_ORDER_API_URL || 'https://commerce-order-service.onrender.com/api',
});

// Add interceptors to attach API Key
const attachToken = (config: any) => {
  const apiKey = localStorage.getItem('adminApiKey');
  if (apiKey && config.headers) {
    config.headers['x-admin-api-key'] = apiKey;
  }
  return config;
};

catalogApi.interceptors.request.use(attachToken);
orderApi.interceptors.request.use(attachToken);
