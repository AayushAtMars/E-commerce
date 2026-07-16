const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/commerce-order-db').then(async () => {
  const Order = mongoose.connection.collection('orders');
  const order = await Order.findOne({ status: { $in: ['On the Way', 'Delivered'] } });
  console.log(JSON.stringify(order.deliveryAgent, null, 2));
  process.exit(0);
});
