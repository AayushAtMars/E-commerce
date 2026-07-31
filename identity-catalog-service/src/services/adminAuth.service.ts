import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { env } from '../config/env';
import { AdminUser, AdminRole } from '../models/AdminUser';
import { createError } from '../middlewares/error.middleware';

const SALT_ROUNDS = 12;

// ─── Token utilities ──────────────────────────────────────────────────────────

export function issueAdminToken(adminId: string, role: AdminRole): string {
  return jwt.sign({ adminId, role }, env.ADMIN_JWT_SECRET, { expiresIn: '8h' });
}

export function verifyAdminToken(token: string): { adminId: string; role: AdminRole } {
  return jwt.verify(token, env.ADMIN_JWT_SECRET) as { adminId: string; role: AdminRole };
}

// ─── CAPTCHA verification ─────────────────────────────────────────────────────

export async function verifyHCaptcha(token: string): Promise<void> {
  // Skip CAPTCHA verification in development if no secret is set
  if (env.isDev && (!env.HCAPTCHA_SECRET || env.HCAPTCHA_SECRET === 'dev_skip')) {
    return;
  }
  try {
    const params = new URLSearchParams();
    params.append('secret', env.HCAPTCHA_SECRET);
    params.append('response', token);

    const res = await axios.post('https://api.hcaptcha.com/siteverify', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 5000,
    });

    if (!res.data.success) {
      throw createError('CAPTCHA verification failed. Please try again.', 400, 'CAPTCHA_FAILED');
    }
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code) {
      throw err; // re-throw our own errors
    }
    throw createError('CAPTCHA service unavailable.', 503, 'CAPTCHA_UNAVAILABLE');
  }
}

// ─── Seed default super admin ────────────────────────────────────────────────

export async function seedSuperAdmin(): Promise<void> {
  const existing = await AdminUser.findOne({ role: 'super_admin' });
  if (existing) return;

  const passwordHash = await bcrypt.hash(env.ADMIN_DEFAULT_PASSWORD, SALT_ROUNDS);
  await AdminUser.create({
    name: 'Super Admin',
    email: env.ADMIN_DEFAULT_EMAIL.toLowerCase(),
    passwordHash,
    role: 'super_admin',
    isActive: true,
  });
  console.log(`[AdminAuth] Seeded default super_admin: ${env.ADMIN_DEFAULT_EMAIL}`);
}

// ─── Login ───────────────────────────────────────────────────────────────────

export async function adminLoginService(email: string, password: string) {
  const admin = await AdminUser.findOne({ email: email.toLowerCase() });
  if (!admin) {
    throw createError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }
  if (!admin.isActive) {
    throw createError('This admin account has been deactivated.', 403, 'ACCOUNT_DEACTIVATED');
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    throw createError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = issueAdminToken(admin._id.toString(), admin.role);
  return { token, admin };
}

// ─── Admin user management ────────────────────────────────────────────────────

export async function listAdminUsers() {
  return AdminUser.find().sort({ createdAt: -1 });
}

export async function createAdminUser(data: {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}) {
  const existing = await AdminUser.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw createError('An admin with this email already exists.', 409, 'EMAIL_TAKEN');
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const admin = await AdminUser.create({
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash,
    role: data.role,
    isActive: true,
  });
  return admin;
}

export async function updateAdminUser(
  adminId: string,
  data: { name?: string; role?: AdminRole; isActive?: boolean; password?: string }
) {
  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.role !== undefined) update.role = data.role;
  if (data.isActive !== undefined) update.isActive = data.isActive;
  if (data.password) {
    update.passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  const admin = await AdminUser.findByIdAndUpdate(adminId, { $set: update }, { new: true, returnDocument: 'after' });
  if (!admin) throw createError('Admin user not found.', 404, 'NOT_FOUND');
  return admin;
}
