import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';
import { Otp } from '../models/Otp';
import { createError } from '../middlewares/error.middleware';
import { sendOtpEmail } from './email.service';

const SALT_ROUNDS = 12;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ─── Password utilities ────────────────────────────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

// ─── Token utilities ──────────────────────────────────────────────────────────

export function issueTokens(userId: string): { accessToken: string; refreshToken: string } {
  const accessToken = jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES as jwt.SignOptions['expiresIn'],
  });
  const refreshToken = jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES as jwt.SignOptions['expiresIn'],
  });
  return { accessToken, refreshToken };
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, env.JWT_SECRET) as { userId: string };
}

// ─── OTP utilities ────────────────────────────────────────────────────────────

function generateOtpCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit
}

export async function createAndSendOtp(
  email: string,
  purpose: 'signup' | 'forgotPassword'
): Promise<string> {
  // Delete any existing OTP for this email + purpose
  await Otp.deleteMany({ email, purpose });

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await Otp.create({ email, code, purpose, expiresAt });

  // Send via nodemailer in the background to prevent API timeouts
  sendOtpEmail(email, code, purpose).catch(err => {
    console.error(`[OTP] Failed to send email to ${email}:`, err);
  });
  console.log(`[OTP] Dispatched ${purpose} email to ${email}`);

  return code;
}

export async function verifyOtp(
  email: string,
  code: string,
  purpose: 'signup' | 'forgotPassword',
  consume = true
): Promise<void> {
  const otp = await Otp.findOne({ email, purpose });

  if (!otp) {
    throw createError('OTP not found. Please request a new one.', 400, 'OTP_NOT_FOUND');
  }
  if (otp.expiresAt < new Date()) {
    await otp.deleteOne();
    throw createError('OTP has expired. Please request a new one.', 400, 'OTP_EXPIRED');
  }
  if (otp.code !== code) {
    throw createError('Invalid OTP code.', 400, 'OTP_INVALID');
  }

  // Consume the OTP only if requested
  if (consume) {
    await otp.deleteOne();
  }
}

// ─── Auth flows ───────────────────────────────────────────────────────────────

export async function signupService(data: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw createError('An account with this email already exists.', 409, 'EMAIL_TAKEN');
  }

  const passwordHash = await hashPassword(data.password);
  const user = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash,
    authProvider: 'local',
    isVerified: false,
  });

  // Send OTP
  await createAndSendOtp(user.email, 'signup');

  return { userId: user._id, email: user.email };
}

export async function verifySignupOtp(email: string, code: string) {
  await verifyOtp(email.toLowerCase(), code, 'signup');

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { isVerified: true },
    { returnDocument: 'after' }
  );
  if (!user) throw createError('User not found.', 404, 'USER_NOT_FOUND');

  const tokens = issueTokens(user._id.toString());
  return { user, ...tokens };
}

export async function loginService(data: { email: string; password: string }) {
  const user = await User.findOne({ email: data.email.toLowerCase() });
  if (!user) {
    throw createError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }
  if (user.isBlocked) {
    throw createError(user.blockReason || 'Your account has been blocked by an administrator.', 403, 'ACCOUNT_BLOCKED');
  }
  if (!user.isVerified) {
    throw createError('Please verify your email before logging in.', 403, 'EMAIL_NOT_VERIFIED');
  }

  const isMatch = await user.comparePassword(data.password);
  if (!isMatch) {
    throw createError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const tokens = issueTokens(user._id.toString());
  return { user, ...tokens };
}

export async function forgotPasswordService(email: string) {
  // Always return success to avoid user enumeration
  const user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    await createAndSendOtp(email.toLowerCase(), 'forgotPassword');
  }
}

export async function resetPasswordService(
  email: string,
  code: string,
  newPassword: string
) {
  await verifyOtp(email.toLowerCase(), code, 'forgotPassword');

  const passwordHash = await hashPassword(newPassword);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { passwordHash },
    { returnDocument: 'after' }
  );
  if (!user) throw createError('User not found.', 404, 'USER_NOT_FOUND');

  const tokens = issueTokens(user._id.toString());
  return { user, ...tokens };
}

export async function refreshTokenService(token: string) {
  let payload: { userId: string };
  try {
    payload = verifyToken(token);
  } catch {
    throw createError('Invalid or expired refresh token.', 401, 'INVALID_TOKEN');
  }

  const user = await User.findById(payload.userId);
  if (!user) throw createError('User not found.', 404, 'USER_NOT_FOUND');
  if (user.isBlocked) {
    throw createError(user.blockReason || 'Your account has been blocked by an administrator.', 403, 'ACCOUNT_BLOCKED');
  }

  const tokens = issueTokens(user._id.toString());
  return { ...tokens };
}

export async function completeProfileService(
  userId: string,
  data: { name?: string; phone?: string; gender?: string; dob?: string; avatarUrl?: string }
) {
  const user = await User.findByIdAndUpdate(userId, data, { returnDocument: 'after' });
  if (!user) throw createError('User not found.', 404, 'USER_NOT_FOUND');
  return user;
}
