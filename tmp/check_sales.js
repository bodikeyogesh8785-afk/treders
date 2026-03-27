const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const DailySale = mongoose.models.DailySale || mongoose.model('DailySale', new mongoose.Schema({
    paymentMethod: String,
    customerName: String,
    quantitySold: Number,
    sellingPrice: Number,
    saleDate: Date
  }, { collection: 'dailysales' }));

  const sales = await DailySale.find().sort({ createdAt: -1 }).limit(5);
  console.log('--- RECENT SALES ---');
  sales.forEach(s => {
    console.log(`Date: ${s.saleDate}, Method: "${s.paymentMethod}", Customer: "${s.customerName}", Total: ${s.quantitySold * s.sellingPrice}`);
  });
  process.exit(0);
}

check();
