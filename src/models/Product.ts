import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true, enum: ['Seeds', 'Fertilizers', 'Pesticides', 'Organic'] },
    price: { type: Number, required: true },
    purchasePrice: { type: Number, required: true, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true, default: 'unit' }, // e.g., KG, L, pack
    subCategory: { type: String }, // For Pesticides: Insecticide, Herbicide
    suitableCrops: { type: String }, // e.g. "Paddy, Cotton, Tomato"
    imageUrl: { type: String },
    description: { type: String },
    lowStockThreshold: { type: Number, default: 10 },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
