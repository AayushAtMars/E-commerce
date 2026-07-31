const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://aayushrajput3105_db_user:Hmr7R2WCAUc1wHLx@project1catalogservice.h5wml5t.mongodb.net/');
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
User.findById('6a56909ea742f512e2039500').then(user => {
  console.log(JSON.stringify(user, null, 2));
  process.exit(0);
});
