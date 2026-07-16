const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb+srv://aayushrajput3105_db_user:AtDGpE0F2ar6nTEf@project1orderservice.r8pv2ir.mongodb.net/test');
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log("Collections:", collections.map(c => c.name));
  
  if (collections.some(c => c.name === 'orders')) {
    const orders = await db.collection('orders').find({}).toArray();
    console.log("Orders count:", orders.length);
    if (orders.length > 0) {
      console.log("Last order:", JSON.stringify(orders[orders.length - 1], null, 2));
    }
  } else {
    console.log("No orders collection!");
  }
  process.exit(0);
}

test();
