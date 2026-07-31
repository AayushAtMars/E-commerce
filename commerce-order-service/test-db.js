const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://aayushrajput3105_db_user:AtDGpE0F2ar6nTEf@project1orderservice.r8pv2ir.mongodb.net/');
const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
Order.find().sort({ createdAt: -1 }).limit(1).then(orders => {
  console.log(JSON.stringify(orders, null, 2));
  process.exit(0);
});
