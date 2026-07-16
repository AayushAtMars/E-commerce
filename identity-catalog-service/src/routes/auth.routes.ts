import { Router } from 'express';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware';
import * as controller from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  completeProfileSchema,
} from '../validators/auth.validators';

const router = Router();

// Rate limiters are now imported from rateLimiter.middleware

// Public routes
router.post('/signup', authRateLimiter, validate({ body: signupSchema }), controller.signup);
router.post('/login', authRateLimiter, validate({ body: loginSchema }), controller.login);
router.post('/verify-otp', authRateLimiter, validate({ body: verifyOtpSchema }), controller.verifyOtp);
router.post('/resend-otp', authRateLimiter, validate({ body: resendOtpSchema }), controller.resendOtp);
router.post('/forgot-password', authRateLimiter, validate({ body: forgotPasswordSchema }), controller.forgotPassword);
router.post('/reset-password', authRateLimiter, validate({ body: resetPasswordSchema }), controller.resetPassword);
router.post('/refresh-token', validate({ body: refreshTokenSchema }), controller.refreshToken);

// Protected routes
router.get('/me', authMiddleware, controller.getMe);
router.patch('/complete-profile', authMiddleware, validate({ body: completeProfileSchema }), controller.completeProfile);

export default router;
