import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/shopDb';

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
});
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function verifyStock() {
  await mongoose.connect(MONGODB_URI);
  
  const urea = await Product.findOne({ name: 'Urea Fertilizer (45KG)' });
  if (!urea) {
    console.error('Product not found!');
    await mongoose.disconnect();
    return;
  }
  
  console.log(`Initial Stock of ${urea.name}: ${urea.stock}`);
  
  // Simulate a sale of 5 units
  const quantityToSell = 5;
  console.log(`Simulating Sale of ${quantityToSell} units...`);
  
  const updatedUrea = await Product.findByIdAndUpdate(urea._id, {
    $inc: { stock: -quantityToSell }
  }, { new: true });
  
  console.log(`Updated Stock: ${updatedUrea.stock}`);
  
  if (updatedUrea.stock === urea.stock - quantityToSell) {
    console.log('SUCCESS: Smart Stock Management logic verified!');
  } else {
    console.error('FAILURE: Stock reduction mismatch!');
  }
  
  await mongoose.disconnect();
}

verifyStock().catch(console.error);
