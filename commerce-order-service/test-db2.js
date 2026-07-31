const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://aayushrajput3105_db_user:AtDGpE0F2ar6nTEf@project1orderservice.r8pv2ir.mongodb.net/');
const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
Order.find().sort({ createdAt: -1 }).limit(1).then(orders => {
  if (orders.length > 0) {
    Order.updateOne({ _id: orders[0]._id }, { $set: { userEmail: 'aayush.test@example.com', userName: 'Aayush' } }).then(() => {
      console.log('updated order with dummy email');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
