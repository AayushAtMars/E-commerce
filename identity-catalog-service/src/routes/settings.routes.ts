import { Router, Request, Response, NextFunction } from 'express';
import { StoreSettings } from '../models/StoreSettings';
import { adminAuthMiddleware, requireRole } from '../middlewares/adminAuth.middleware';

const router = Router();

async function getSettingsDoc() {
  let settings = await StoreSettings.findOne();
  if (!settings) {
    settings = await StoreSettings.create({});
  }
  return settings;
}

// Public endpoint to get global settings (used by app to check maintenance mode)
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await getSettingsDoc();
    res.json({ success: true, data: { settings } });
  } catch (err) {
    next(err);
  }
});

// Admin endpoint to update settings
router.patch('/', adminAuthMiddleware, requireRole('super_admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { maintenanceMode, minimumOrderValue, storeContactEmail } = req.body;
    let settings = await getSettingsDoc();

    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (minimumOrderValue !== undefined) settings.minimumOrderValue = minimumOrderValue;
    if (storeContactEmail !== undefined) settings.storeContactEmail = storeContactEmail;

    await settings.save();
    res.json({ success: true, message: 'Settings updated successfully.', data: { settings } });
  } catch (err) {
    next(err);
  }
});

export default router;
