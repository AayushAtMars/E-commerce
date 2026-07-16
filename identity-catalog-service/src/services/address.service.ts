import { Address } from '../models/Address';
import { createError } from '../middlewares/error.middleware';

export async function getUserAddresses(userId: string) {
  return Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
}

export async function createAddress(userId: string, data: {
  label: string;
  line1: string;
  floor?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}) {
  if (data.isDefault) {
    // Un-default all others
    await Address.updateMany({ userId }, { isDefault: false });
  }
  // If first address, make it default
  const count = await Address.countDocuments({ userId });
  const isDefault = data.isDefault ?? (count === 0);
  return Address.create({ userId, ...data, isDefault } as Parameters<typeof Address.create>[0]);
}

export async function updateAddress(userId: string, addressId: string, data: Partial<{
  label: string;
  line1: string;
  floor: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}>) {
  if (data.isDefault) {
    await Address.updateMany({ userId }, { isDefault: false });
  }
  const address = await Address.findOneAndUpdate(
    { _id: addressId, userId },
    data,
    { returnDocument: 'after' }
  );
  if (!address) throw createError('Address not found.', 404, 'ADDRESS_NOT_FOUND');
  return address;
}

export async function deleteAddress(userId: string, addressId: string) {
  const result = await Address.deleteOne({ _id: addressId, userId });
  if (result.deletedCount === 0) {
    throw createError('Address not found.', 404, 'ADDRESS_NOT_FOUND');
  }
}

export async function setDefaultAddress(userId: string, addressId: string) {
  await Address.updateMany({ userId }, { isDefault: false });
  const address = await Address.findOneAndUpdate(
    { _id: addressId, userId },
    { isDefault: true },
    { returnDocument: 'after' }
  );
  if (!address) throw createError('Address not found.', 404, 'ADDRESS_NOT_FOUND');
  return address;
}
