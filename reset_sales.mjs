import DailySale from './src/models/DailySale.ts';
import mongoose from 'mongoose';

async function resetTodaySales() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopDb';
  await mongoose.connect(uri);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  console.log(`Deleting sales between ${start.toISOString()} and ${end.toISOString()}...`);
  const result = await DailySale.deleteMany({
    saleDate: { $gte: start, $lte: end }
  });
  console.log(`Deleted ${result.deletedCount} sales.`);
  process.exit(0);
}

resetTodaySales().catch(err => {
  console.error(err);
  process.exit(1);
});
