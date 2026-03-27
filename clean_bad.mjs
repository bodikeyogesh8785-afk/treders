import mongoose from 'mongoose';

async function cleanBadRecords() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopDb');
  const db = mongoose.connection.db;
  const result = await db.collection('dailysales').deleteMany({ customerName: { $exists: false } });
  console.log('Deleted bad records:', result.deletedCount);
  
  // Show remaining records
  const remaining = await db.collection('dailysales').find({}).sort({ createdAt: -1 }).limit(10).toArray();
  remaining.forEach(s => console.log(s.customerName?.padEnd(25), '->', s.paymentMethod));
  
  process.exit(0);
}
cleanBadRecords().catch(err => { console.error(err); process.exit(1); });
