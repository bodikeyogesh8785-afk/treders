import mongoose from 'mongoose';

const DailySaleSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantitySold: { type: Number, required: true },
    sellingPrice: { type: Number, required: true }, // Price at time of sale
    purchasePrice: { type: Number, required: true }, // Cost at time of sale
    paymentMethod: { type: String },
    customerName: { type: String },
    saleDate: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.DailySale || mongoose.model('DailySale', DailySaleSchema);
