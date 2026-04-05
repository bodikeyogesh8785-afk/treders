'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Upload, X, Package, Ruler, Tag } from 'lucide-react';

export default function AddProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Seeds',
    subCategory: '',
    price: '',
    purchasePrice: '',
    stock: '',
    unitValue: '',
    unitType: 'KG',
    suitableCrops: '',
    imageUrl: '',
    description: '',
    lowStockThreshold: '10',
    mfgDate: '',
    expDate: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = formData.imageUrl;

      // Handle image upload with Base64 encoding (Vercel compatible)
      if (imageFile) {
        try {
          finalImageUrl = await compressImage(imageFile);
        } catch (error) {
          toast.error('Image processing failed');
          setLoading(false);
          return;
        }
      }

      const payload = {
        ...formData,
        unit: `${formData.unitValue} ${formData.unitType}`,
        imageUrl: finalImageUrl,
        price: Number(formData.price),
        purchasePrice: Number(formData.purchasePrice),
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        mfgDate: formData.mfgDate || null,
        expDate: formData.expDate || null,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Product added successfully!');
        router.push('/admin/products');
      } else {
        toast.error('Failed to add product');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
        <Package className="text-green-600" size={36} />
        Add New Product
      </h1>
      
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Basic Info */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Basic Information</h2>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Product Name</label>
              <input required type="text" className="input-field" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Premium Urea" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Category</label>
                <div className="relative">
                  <select required className="input-field appearance-none cursor-pointer" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value, subCategory: ''})}>
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Pesticides">Pesticides</option>
                    <option value="Organic">Organic</option>
                  </select>
                </div>
              </div>
              
              {formData.category === 'Pesticides' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Sub-Category</label>
                  <select required className="input-field cursor-pointer" value={formData.subCategory} onChange={(e) => setFormData({...formData, subCategory: e.target.value})}>
                    <option value="">Select Option</option>
                    <option value="Insecticide">Insecticide</option>
                    <option value="Herbicide">Herbicide</option>
                  </select>
                </div>
              )}
            </div>
          </section>

          {/* Pricing & Stock */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Pricing & Scale</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Sale Price (₹)</label>
                <input required type="number" min="0" className="input-field" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Purchase Price (Cost)</label>
                <input required type="number" min="0" className="input-field" value={formData.purchasePrice} onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})} placeholder="0.00" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Stock Count</label>
                <input required type="number" min="0" className="input-field" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} placeholder="50" />
              </div>
              
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 md:col-span-1">
                <label className="block text-sm font-bold text-rose-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                   Alert At (Qty)
                </label>
                <input required type="number" min="0" className="input-field border-rose-200 focus:border-rose-500" value={formData.lowStockThreshold} onChange={(e) => setFormData({...formData, lowStockThreshold: e.target.value})} placeholder="10" />
                <p className="text-[10px] text-rose-400 font-bold mt-2 uppercase">Warn me when stock hits this</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Type of Crops (Optional)</label>
                <input type="text" className="input-field" value={formData.suitableCrops} onChange={(e) => setFormData({...formData, suitableCrops: e.target.value})} placeholder="e.g. Paddy, Cotton, Tomato" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <Ruler size={16} /> Scale / Unit
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input required type="text" className="input-field" value={formData.unitValue} onChange={(e) => setFormData({...formData, unitValue: e.target.value})} placeholder="Value (e.g. 500)" />
                  <select className="input-field cursor-pointer" value={formData.unitType} onChange={(e) => setFormData({...formData, unitType: e.target.value})}>
                    <option value="ML">ML</option>
                    <option value="L">Liters (L)</option>
                    <option value="KG">KG</option>
                    <option value="Grams">Grams (g)</option>
                    <option value="Pack">Pack</option>
                    <option value="Unit">Single Unit</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Dates Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Product Lifetime</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <label className="block text-sm font-bold text-blue-800 mb-2 uppercase tracking-wide">Manufacturing Date (MFG)</label>
                <input type="date" className="input-field border-blue-200 focus:border-blue-500" value={formData.mfgDate} onChange={(e) => setFormData({...formData, mfgDate: e.target.value})} />
              </div>
              <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                <label className="block text-sm font-bold text-orange-800 mb-2 uppercase tracking-wide">Expiry Date (EXP)</label>
                <input type="date" className="input-field border-orange-200 focus:border-orange-500" value={formData.expDate} onChange={(e) => setFormData({...formData, expDate: e.target.value})} />
              </div>
            </div>
          </section>

          {/* Image Upload */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Product Media</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Upload Image</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:border-green-500 transition-colors group cursor-pointer text-center">
                  <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                  <Upload className="mx-auto text-gray-400 group-hover:text-green-600 mb-2" size={48} />
                  <p className="text-sm text-gray-500">Click or drag and drop to upload product photo</p>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="text-gray-400" size={16} />
                  </div>
                  <input type="text" className="input-field pl-10" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} placeholder="Or paste external Image URL..." />
                </div>
              </div>

              {previewUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 aspect-square bg-gray-50 flex items-center justify-center">
                  <img src={previewUrl} alt="Preview" className="max-h-full object-contain" />
                  <button type="button" onClick={() => { setImageFile(null); setPreviewUrl(''); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition shadow-lg">
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
          </section>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Description</label>
            <textarea className="input-field" rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Enter detailed product description..."></textarea>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button type="button" onClick={() => router.back()} className="px-8 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-bold transition">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary px-10 py-3 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
