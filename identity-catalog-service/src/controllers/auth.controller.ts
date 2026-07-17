import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { User } from '../models/User';
import { createError } from '../middlewares/error.middleware';

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.signupService(req.body);
    res.status(201).json({
      success: true,
      message: 'Account created. Please check your console for the OTP.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, code, purpose } = req.body;

    if (purpose === 'signup') {
      const result = await authService.verifySignupOtp(email, code);
      res.json({ success: true, message: 'Email verified.', data: result });
    } else {
      // For forgotPassword, just verify the OTP — reset happens on /reset-password
      // Pass false to ensure the OTP isn't deleted, so it's still there for resetPassword
      await authService.verifyOtp(email.toLowerCase(), code, 'forgotPassword', false);
      res.json({ success: true, message: 'OTP verified.' });
    }
  } catch (err) {
    next(err);
  }
}

export async function resendOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, purpose } = req.body;
    await authService.createAndSendOtp(email.toLowerCase(), purpose);
    res.json({ success: true, message: 'OTP resent.' });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.loginService(req.body);
    res.json({ success: true, message: 'Logged in successfully.', data: result });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.forgotPasswordService(req.body.email);
    res.json({
      success: true,
      message: 'If that email exists, an OTP has been sent.',
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, code, newPassword } = req.body;
    const result = await authService.resetPasswordService(email, code, newPassword);
    res.json({ success: true, message: 'Password reset successfully.', data: result });
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.refreshTokenService(req.body.refreshToken);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return next(createError('User not found.', 404, 'USER_NOT_FOUND'));
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function completeProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.completeProfileService(req.userId!, req.body);
    res.json({ success: true, message: 'Profile updated.', data: { user } });
  } catch (err) {
    next(err);
  }
}
