const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const DailySale = mongoose.models.DailySale || mongoose.model('DailySale', new mongoose.Schema({
    paymentMethod: String,
    customerName: String,
    quantitySold: Number,
    sellingPrice: Number,
    saleDate: Date,
    notes: String
  }, { collection: 'dailysales' }));

  const sales = await DailySale.find().sort({ createdAt: -1 }).limit(10);
  console.log('--- RECENT 10 SALES ---');
  sales.forEach(s => {
    console.log(`[${s.createdAt}] Mode: "${s.paymentMethod}", Customer: "${s.customerName}", Total: ${s.quantitySold * s.sellingPrice}, Notes: "${s.notes}"`);
  });
  process.exit(0);
}

check();
