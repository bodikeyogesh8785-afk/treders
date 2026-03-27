import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/shopDb';

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true, enum: ['Seeds', 'Fertilizers', 'Pesticides', 'Organic'] },
    subCategory: { type: String },
    suitableCrops: { type: String },
    price: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, default: 'unit' },
    imageUrl: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const products = [
  { name: 'Urea Fertilizer', category: 'Fertilizers', suitableCrops: 'Paddy, Maize, Sugarcane', price: 950, purchasePrice: 800, stock: 100, unit: '45 KG', imageUrl: '/images/urea_new.png', description: 'Rich nitrogen fertilizer for lush green and vigorous plant growth.' },
  { name: 'DAP Fertilizer', category: 'Fertilizers', suitableCrops: 'Cotton, Wheat, Pulses', price: 1250, purchasePrice: 1100, stock: 50, unit: '50 KG', imageUrl: '/images/dap_new.png', description: 'Diammonium Phosphate provides excellent phosphorus and nitrogen for root development.' },
  { name: 'HumiPlant Organic Growth Booster', category: 'Organic', suitableCrops: 'All Crops, Vegetables, Fruits', price: 480, purchasePrice: 350, stock: 65, unit: '500 ML', imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&q=80', description: 'Advanced organic plant growth promoter derived from humic acids for increased yield.' },
  { name: 'Premium Hybrid Tomato Seeds', category: 'Seeds', suitableCrops: 'Tomato', price: 350, purchasePrice: 200, stock: 200, unit: '10 Grams', imageUrl: '/images/tomato_new.png', description: 'High-yielding, disease-resistant tomato seeds suitable for both polyhouse and open fields.' },
  { name: 'BT Cotton Seeds', category: 'Seeds', suitableCrops: 'Cotton', price: 800, purchasePrice: 650, stock: 150, unit: '1 KG', imageUrl: 'https://images.unsplash.com/photo-1622353342531-97b7cb4208a0?w=800&q=80', description: 'High-grade cotton seeds adapted to hot climates with excellent pest resistance.' },
  { name: 'Glyphosate 41% SL', category: 'Pesticides', subCategory: 'Herbicide', suitableCrops: 'Non-crop areas, Tea, Cotton', price: 600, purchasePrice: 500, stock: 40, unit: '1 L', imageUrl: 'https://images.unsplash.com/photo-1625243160411-bc608ae31eb5?w=800&q=80', description: 'A highly effective non-selective systemic herbicide to eliminate tough weeds and grasses.' },
  { name: 'Chlorpyrifos 20% EC', category: 'Pesticides', subCategory: 'Insecticide', suitableCrops: 'Paddy, Cotton, Sugarcane', price: 450, purchasePrice: 380, stock: 10, unit: '500 ML', imageUrl: 'https://images.unsplash.com/photo-1591871217730-179339e802de?w=800&q=80', description: 'Broad-spectrum insecticide highly effective against termites, shoot borers, and root bugs.' },
  { name: 'Onion Seeds - Red Variety', category: 'Seeds', suitableCrops: 'Onion', price: 150, purchasePrice: 100, stock: 300, unit: '100 Grams', imageUrl: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=800&q=80', description: 'Best choice for red pungent onions with long shelf-life.' }
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log('Successfully re-seeded with Organic category data!');
  await mongoose.disconnect();
}
seed().catch(err => {
  console.error(err);
  process.exit(1);
});
