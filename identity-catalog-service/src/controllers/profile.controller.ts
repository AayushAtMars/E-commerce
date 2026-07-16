import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as profileService from '../services/profile.service';

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await profileService.updateProfile(req.userId!, req.body);
    res.json({ success: true, message: 'Profile updated.', data: { user } });
  } catch (err) { next(err); }
}

export async function changePassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await profileService.changePassword(req.userId!, currentPassword, newPassword);
    res.json({ success: true, message: result.message });
  } catch (err) { next(err); }
}

export async function deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { password } = req.body;
    const result = await profileService.deleteAccount(req.userId!, password);
    res.json({ success: true, message: result.message });
  } catch (err) { next(err); }
}

export async function updateNotificationPrefs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await profileService.updateNotificationPrefs(req.userId!, req.body);
    res.json({ success: true, message: 'Preferences updated.', data: result });
  } catch (err) { next(err); }
}
