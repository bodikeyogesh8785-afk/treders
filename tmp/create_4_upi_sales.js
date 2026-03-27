const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Define schemas if model not found
  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({ name: String, price: Number, purchasePrice: Number }));
  const DailySale = mongoose.models.DailySale || mongoose.model('DailySale', new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantitySold: Number,
    sellingPrice: Number,
    purchasePrice: Number,
    paymentMethod: String,
    customerName: String,
    saleDate: { type: Date, default: Date.now }
  }));

  const product = await Product.findOne();
  if (!product) {
    console.log('No product found to create sales.');
    process.exit(1);
  }

  console.log(`Using product: ${product.name} (ID: ${product._id})`);

  for (let i = 1; i <= 4; i++) {
    const sale = await DailySale.create({
      product: product._id,
      quantitySold: 1,
      sellingPrice: 1000 + (i * 100), // Different prices
      purchasePrice: 500,
      paymentMethod: 'UPI',
      customerName: `UPI Test Customer ${i}`,
      notes: `Auto-generated test sale ${i}`
    });
    console.log(`Created UPI Sale ${i}: ₹${sale.sellingPrice}`);
  }

  console.log('Done creating 4 UPI sales.');
  process.exit(0);
}

verify();
