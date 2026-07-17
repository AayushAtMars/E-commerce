import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  PORT: parseInt(process.env.PORT ?? '4001', 10),
  MONGODB_URI: requireEnv('MONGODB_URI'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES ?? '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  INTERNAL_SERVICE_KEY: requireEnv('INTERNAL_SERVICE_KEY'),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  isDev: process.env.NODE_ENV !== 'production',
  CLOUDINARY_CLOUD_NAME: requireEnv('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: requireEnv('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: requireEnv('CLOUDINARY_API_SECRET'),

  // Email
  RESEND_API_KEY: requireEnv('RESEND_API_KEY'),

  RATE_LIMIT_PUBLIC_MAX: parseInt(process.env.RATE_LIMIT_PUBLIC_MAX ?? '100', 10),
  RATE_LIMIT_AUTH_MAX: parseInt(process.env.RATE_LIMIT_AUTH_MAX ?? '5', 10),
  RATE_LIMIT_AUTH_MAX_CONSECUTIVE_FAILS: parseInt(process.env.RATE_LIMIT_AUTH_MAX_CONSECUTIVE_FAILS ?? '5', 10),
  RATE_LIMIT_USER_MAX: parseInt(process.env.RATE_LIMIT_USER_MAX ?? '200', 10),
};
