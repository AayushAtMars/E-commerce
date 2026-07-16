import { catalogApi } from './client';

export interface Address {
  _id: string;
  label: string;
  line1: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isDefault: boolean;
}

export const addressApiModule = {
  getAddresses: () => catalogApi.get('/api/addresses'),
  addAddress: (data: Omit<Address, '_id' | 'isDefault'>) =>
    catalogApi.post('/api/addresses', data),
  updateAddress: (id: string, data: Partial<Address>) =>
    catalogApi.put(`/api/addresses/${id}`, data),
  deleteAddress: (id: string) => catalogApi.delete(`/api/addresses/${id}`),
  setDefaultAddress: (id: string) => catalogApi.put(`/api/addresses/${id}/default`),
};
