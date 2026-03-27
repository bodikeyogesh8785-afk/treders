import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    shopName: { type: String, default: 'SRI JAGRUTHI TRADERS' },
    phone: { type: String, default: '9640799154' },
    whatsapp: { type: String, default: '9640799154' },
    address: { type: String, default: 'Dharmora, Madel Lokeshwaram, District Nirmal 504104' },
    email: { type: String, default: 'admin@srijagruthi.com' },
    lowStockThreshold: { type: Number, default: 10 },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
