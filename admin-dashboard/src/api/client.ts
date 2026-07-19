import axios from 'axios';

// Using deployed production endpoints
export const catalogApi = axios.create({
  baseURL: 'https://identity-catalog-service.onrender.com/api',
});

export const orderApi = axios.create({
  baseURL: 'https://commerce-order-service.onrender.com/api',
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
