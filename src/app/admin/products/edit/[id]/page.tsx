'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Upload, X, Package, Ruler, Tag } from 'lucide-react';

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const product = await res.json();
          const unitParts = (product.unit || '1 KG').split(' ');
          const uValue = unitParts[0] || '';
          const uType = unitParts[1] || 'KG';
          
          setFormData({
            name: product.name || '',
            category: product.category || 'Seeds',
            subCategory: product.subCategory || '',
            price: product.price?.toString() || '',
            purchasePrice: product.purchasePrice?.toString() || '',
            stock: product.stock?.toString() || '',
            unitValue: uValue,
            unitType: uType,
            suitableCrops: product.suitableCrops || '',
            imageUrl: product.imageUrl || '',
            description: product.description || '',
            lowStockThreshold: product.lowStockThreshold?.toString() || '10',
            mfgDate: product.mfgDate ? new Date(product.mfgDate).toISOString().split('T')[0] : '',
            expDate: product.expDate ? new Date(product.expDate).toISOString().split('T')[0] : '',
          });
          if (product.imageUrl) {
            setPreviewUrl(product.imageUrl);
          }
        } else {
          toast.error('Product not found');
          router.push('/admin/products');
        }
      } catch (err) {
        toast.error('Error fetching product details');
      } finally {
        setFetching(false);
      }
    };
    loadProduct();
  }, [id, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = formData.imageUrl;

      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });
        
        if (uploadRes.ok) {
          const { imageUrl } = await uploadRes.json();
          finalImageUrl = imageUrl;
        } else {
          toast.error('Image upload failed');
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

      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Product updated successfully!');
        router.push('/admin/products');
      } else {
        toast.error('Failed to update product');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="text-center py-20 text-gray-500">Loading product data...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center py-8">
      <div className="w-full">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
          <Package className="text-blue-600" size={36} />
          Edit Product
        </h1>
        
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Basic Information</h2>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Product Name</label>
                <input required type="text" className="input-field w-full bg-gray-50 border border-gray-200 p-3 rounded-lg" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Premium Urea" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Category</label>
                  <select required className="input-field bg-gray-50 border border-gray-200 p-3 rounded-lg w-full" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value, subCategory: ''})}>
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Pesticides">Pesticides</option>
                    <option value="Organic">Organic</option>
                  </select>
                </div>
                
                {formData.category === 'Pesticides' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Sub-Category</label>
                    <select required className="input-field bg-gray-50 border border-gray-200 p-3 rounded-lg w-full" value={formData.subCategory} onChange={(e) => setFormData({...formData, subCategory: e.target.value})}>
                      <option value="">Select Option</option>
                      <option value="Insecticide">Insecticide</option>
                      <option value="Herbicide">Herbicide</option>
                    </select>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Pricing & Scale</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Sale Price (₹)</label>
                  <input required type="number" min="0" className="input-field w-full bg-gray-50 border border-gray-200 p-3 rounded-lg" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Purchase Price</label>
                  <input required type="number" min="0" className="input-field w-full bg-gray-50 border border-gray-200 p-3 rounded-lg" value={formData.purchasePrice} onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Stock Count</label>
                  <input required type="number" min="0" className="input-field w-full bg-gray-50 border border-gray-200 p-3 rounded-lg" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
                </div>
                
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 md:col-span-1">
                  <label className="block text-sm font-bold text-rose-700 mb-2 uppercase tracking-wide">Alert At (Qty)</label>
                  <input required type="number" min="0" className="input-field w-full border-rose-200 p-2 rounded-lg" value={formData.lowStockThreshold} onChange={(e) => setFormData({...formData, lowStockThreshold: e.target.value})} />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Suitable Crops</label>
                  <input type="text" className="input-field w-full bg-gray-50 border border-gray-200 p-3 rounded-lg" value={formData.suitableCrops} onChange={(e) => setFormData({...formData, suitableCrops: e.target.value})} />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <Ruler size={16} /> Scale / Unit
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input required type="text" className="input-field w-full bg-gray-50 border border-gray-200 p-3 rounded-lg" value={formData.unitValue} onChange={(e) => setFormData({...formData, unitValue: e.target.value})} />
                    <select className="input-field w-full bg-gray-50 border border-gray-200 p-3 rounded-lg" value={formData.unitType} onChange={(e) => setFormData({...formData, unitType: e.target.value})}>
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

            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Product Lifetime</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                  <label className="block text-sm font-bold text-blue-800 mb-2 uppercase tracking-wide">MFG Date</label>
                  <input type="date" className="input-field w-full p-2 rounded-lg" value={formData.mfgDate} onChange={(e) => setFormData({...formData, mfgDate: e.target.value})} />
                </div>
                <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                  <label className="block text-sm font-bold text-orange-800 mb-2 uppercase tracking-wide">EXP Date</label>
                  <input type="date" className="input-field w-full p-2 rounded-lg" value={formData.expDate} onChange={(e) => setFormData({...formData, expDate: e.target.value})} />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Product Media</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Upload New Image</label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:border-blue-500 transition-colors group cursor-pointer text-center">
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                    <Upload className="mx-auto text-gray-400 group-hover:text-blue-600 mb-2" size={48} />
                    <p className="text-sm text-gray-500">Click or drag and drop to replace image</p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Tag className="text-gray-400" size={16} />
                    </div>
                    <input type="text" className="input-field w-full bg-gray-50 border border-gray-200 p-3 pl-10 rounded-lg" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} placeholder="Or paste external Image URL..." />
                  </div>
                </div>

                {previewUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200 aspect-square bg-gray-50 flex items-center justify-center">
                    <img src={previewUrl} alt="Preview" className="max-h-full object-contain" />
                    <button type="button" onClick={() => { setImageFile(null); setPreviewUrl(''); setFormData(p => ({...p, imageUrl: ''})) }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition shadow-lg">
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            </section>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Description</label>
              <textarea className="input-field w-full bg-gray-50 border border-gray-200 p-3 rounded-lg" rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <button type="button" onClick={() => router.back()} className="px-8 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-bold transition">Cancel</button>
              <button type="submit" disabled={loading} className="bg-blue-600 font-bold text-white px-10 py-3 rounded-xl disabled:opacity-50 hover:bg-blue-700 shadow-xl transition-all">
                {loading ? 'Saving Changes...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
