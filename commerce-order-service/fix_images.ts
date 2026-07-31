import mongoose from 'mongoose';
import { Order } from './src/models/Order';
import axios from 'axios';
import { env } from './src/config/env';
import { connectDB } from './src/config/db';

async function run() {
  await connectDB();
  const orders = await Order.find({});
  for (const order of orders) {
    let changed = false;
    for (const item of order.items) {
      if (!item.image) {
        try {
          const res = await axios.get(`${env.CATALOG_SERVICE_URL}/internal/products/${item.productId}/price`, { headers: { 'x-internal-key': env.INTERNAL_SERVICE_KEY } });
          if (res.data.data.image) {
            item.image = res.data.data.image;
            changed = true;
          }
        } catch (e) { console.log('Error fetching', item.productId); }
      }
    }
    if (changed) {
      console.log('Updating order', order.orderNumber);
      order.markModified('items');
      await order.save();
    }
  }
  console.log('Done');
  process.exit(0);
}
run();
