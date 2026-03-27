import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/shopDb';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Customer'], default: 'Customer' },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
  await mongoose.connect(MONGODB_URI);
  
  const existingAdmin = await User.findOne({ email: 'admin@srijagruthi.com' });
  if (existingAdmin) {
    console.log('Admin already exists.');
  } else {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin User',
      email: 'admin@srijagruthi.com',
      password: hashedPassword,
      role: 'Admin'
    });
    console.log('Admin account created successfully!');
    console.log('Email: admin@srijagruthi.com');
    console.log('Password: admin123');
  }
  
  await mongoose.disconnect();
}

createAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
