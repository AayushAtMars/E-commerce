import { Router, Request, Response, NextFunction } from 'express';
import { seedDeliveryPartners } from '../seeds/seedDeliveryPartners';
import { DeliveryPartner } from '../models/DeliveryPartner';
import { Order } from '../models/Order';

const router = Router();

// POST /api/admin/seed-delivery-partners  — idempotent seed trigger
router.post('/seed-delivery-partners', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await seedDeliveryPartners();
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// GET /api/admin/delivery-partners — list all partners (for inspection)
router.get('/delivery-partners', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const partners = await DeliveryPartner.find().sort({ ordersCount: 1 });
    res.json({ success: true, data: { partners, count: partners.length } });
  } catch (err) { next(err); }
});

// DELETE /api/admin/delivery-partners/reset-counts — reset all ordersCount to 0 (restart round-robin)
router.delete('/delivery-partners/reset-counts', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await DeliveryPartner.updateMany({}, { $set: { ordersCount: 0 } });
    res.json({ success: true, message: 'Round-robin counters reset.' });
  } catch (err) { next(err); }
});

// POST /api/admin/fix-old-orders — clears hardcoded agents from old mock data so new logic works
router.post('/fix-old-orders', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await Order.updateMany({}, { $unset: { deliveryAgent: "" } });
    await DeliveryPartner.updateMany({}, { $set: { ordersCount: 0 } });
    
    // Re-assign immediately for any that are already On the Way or Delivered
    const ordersToFix = await Order.find({ status: { $in: ['On the Way', 'Delivered'] } });
    let fixed = 0;
    for (const o of ordersToFix) {
      const partner = await DeliveryPartner.findOneAndUpdate(
        { isActive: true },
        { $inc: { ordersCount: 1 } },
        { sort: { ordersCount: 1, _id: 1 }, new: false }
      );
      if (partner) {
        o.deliveryAgent = {
          _id: partner._id.toString(),
          name: partner.name,
          phone: partner.phone,
          avatar: partner.avatar,
          vehicle: partner.vehicle,
          rating: partner.rating,
        };
        await o.save();
        fixed++;
      }
    }
    
    res.json({ success: true, message: `Cleared mock agents. Reassigned ${fixed} active orders.` });
  } catch (err) { next(err); }
});

export default router;
