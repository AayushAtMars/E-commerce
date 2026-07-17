require('dotenv').config({ path: '/home/aayush/Desktop/firstProject/identity-catalog-service/.env' });
const mongoose = require('mongoose');

async function getOtp() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const otps = await db.collection('otps').find({}).toArray();
  console.log("All OTPs:");
  console.log(otps);
  process.exit(0);
}

getOtp();
