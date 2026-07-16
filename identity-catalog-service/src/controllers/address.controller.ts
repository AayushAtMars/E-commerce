import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as addressService from '../services/address.service';

export async function getAddresses(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const addresses = await addressService.getUserAddresses(req.userId!);
    res.json({ success: true, data: { addresses } });
  } catch (err) { next(err); }
}

export async function createAddress(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const address = await addressService.createAddress(req.userId!, req.body);
    res.status(201).json({ success: true, message: 'Address added.', data: { address } });
  } catch (err) { next(err); }
}

export async function updateAddress(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const address = await addressService.updateAddress(req.userId!, String(req.params.id), req.body);
    res.json({ success: true, message: 'Address updated.', data: { address } });
  } catch (err) { next(err); }
}

export async function deleteAddress(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await addressService.deleteAddress(req.userId!, String(req.params.id));
    res.json({ success: true, message: 'Address deleted.' });
  } catch (err) { next(err); }
}

export async function setDefault(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const address = await addressService.setDefaultAddress(req.userId!, String(req.params.id));
    res.json({ success: true, message: 'Default address updated.', data: { address } });
  } catch (err) { next(err); }
}
