import mongoose from 'mongoose';
import { env } from '../config/env';
import { Order } from '../models/Order';
import { DeliveryPartner } from '../models/DeliveryPartner';

async function assignNextDeliveryPartner() {
  const partner = await DeliveryPartner.findOneAndUpdate(
    { isActive: true },
    { $inc: { ordersCount: 1 } },
    { sort: { ordersCount: 1, _id: 1 }, new: false }
  );
  if (!partner) return null;
  return {
    _id: partner._id.toString(),
    name: partner.name,
    phone: partner.phone,
    avatar: partner.avatar,
    vehicle: partner.vehicle,
    rating: partner.rating,
  };
}

async function fix() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected');
  
  // Wipe old agents
  await Order.updateMany({}, { $unset: { deliveryAgent: "" } });
  await DeliveryPartner.updateMany({}, { $set: { ordersCount: 0 } });
  console.log('Wiped old agents & counts');
  
  const ordersToFix = await Order.find({ status: { $in: ['On the Way', 'Delivered'] } });
  for (const o of ordersToFix) {
    const p = await assignNextDeliveryPartner();
    if (p) {
      o.deliveryAgent = p;
      await o.save();
    }
  }
  console.log(`Reassigned new agents to ${ordersToFix.length} active/past orders`);
  
  mongoose.disconnect();
}
fix().catch(console.error);
