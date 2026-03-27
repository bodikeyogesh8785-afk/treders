import mongoose from 'mongoose';
import DailySale from './src/models/DailySale.ts';
import Product from './src/models/Product.ts';

async function createTestSales() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopDb';
  await mongoose.connect(uri);
  
  const p = await Product.findOne({name: /Urea/i});
  const productId = p._id;
  const purchasePrice = p.purchasePrice || 0;

  console.log("Creating Test Sales...");

  // Test 1: Explicit Cash
  await DailySale.create({
    product: productId,
    quantitySold: 1,
    sellingPrice: 1000,
    purchasePrice: purchasePrice,
    paymentMethod: 'Cash',
    customerName: 'Test Cash Customer',
    saleDate: new Date()
  });

  // Test 2: Explicit UPI
  await DailySale.create({
    product: productId,
    quantitySold: 1,
    sellingPrice: 2000,
    purchasePrice: purchasePrice,
    paymentMethod: 'UPI',
    customerName: 'Test UPI Customer',
    saleDate: new Date()
  });

  // Test 3: Safety Net UPI (Notes detection)
  await DailySale.create({
    product: productId,
    quantitySold: 1,
    sellingPrice: 3000,
    purchasePrice: purchasePrice,
    paymentMethod: 'Cash', // Marked as cash but has UPI notes
    notes: 'Payment done via UPI UPI',
    customerName: 'Test Notes Customer',
    saleDate: new Date()
  });

  console.log("Test Sales Created Successfully!");
  process.exit(0);
}

createTestSales().catch(err => {
  console.error(err);
  process.exit(1);
});
