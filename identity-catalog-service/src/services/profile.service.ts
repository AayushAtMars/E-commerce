import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { createError } from '../middlewares/error.middleware';
import mongoose from 'mongoose';

// ─── Update profile ───────────────────────────────────────────────────────────

export async function updateProfile(
  userId: string,
  data: { name?: string; phone?: string; dob?: string; gender?: 'Male' | 'Female' | 'Other'; avatarUrl?: string }
) {
  const update: Record<string, string> = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.phone !== undefined) update.phone = data.phone;
  if (data.dob !== undefined) update.dob = data.dob;
  if (data.gender !== undefined) update.gender = data.gender;
  if (data.avatarUrl !== undefined) update.avatarUrl = data.avatarUrl;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: update },
    { new: true, runValidators: true, returnDocument: 'after' }
  );
  if (!user) throw createError('User not found.', 404, 'USER_NOT_FOUND');
  return user;
}

// ─── Change password ─────────────────────────────────────────────────────────

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await User.findById(userId);
  if (!user) throw createError('User not found.', 404, 'USER_NOT_FOUND');

  const valid = await user.comparePassword(currentPassword);
  if (!valid) throw createError('Current password is incorrect.', 401, 'INVALID_PASSWORD');

  if (newPassword.length < 8) throw createError('Password must be at least 8 characters.', 400, 'WEAK_PASSWORD');

  const hash = await bcrypt.hash(newPassword, 12);
  await User.findByIdAndUpdate(userId, { passwordHash: hash });
  return { message: 'Password changed successfully.' };
}

// ─── Delete account ───────────────────────────────────────────────────────────

export async function deleteAccount(userId: string, password: string) {
  const user = await User.findById(userId);
  if (!user) throw createError('User not found.', 404, 'USER_NOT_FOUND');

  const valid = await user.comparePassword(password);
  if (!valid) throw createError('Incorrect password.', 401, 'INVALID_PASSWORD');

  await User.findByIdAndDelete(userId);
  return { message: 'Account deleted.' };
}

// ─── Notification preferences (stored on user doc — Phase 5 stub) ─────────────

export async function updateNotificationPrefs(
  userId: string,
  prefs: { orderUpdates?: boolean; promotions?: boolean; newArrivals?: boolean }
) {
  // In a full implementation, this would update a settings sub-document
  // For Phase 5, we treat it as a success and return the preferences back
  return { userId, prefs };
}
