'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  const expiredProducts = products.filter((p: any) => p.expDate && new Date(p.expDate) < new Date());
  const nearExpiryProducts = products.filter((p: any) => {
    if (!p.expDate) return false;
    const exp = new Date(p.expDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return exp > today && exp <= thirtyDaysFromNow;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product deleted');
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter((p: any) => 
    (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="pb-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Products Management</h1>
        <Link href="/admin/products/add" className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-lg hover:shadow-green-200 transition-all">
          <Plus size={20} /> Add Product
        </Link>
      </div>

      <div className="mb-8 relative max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="text-gray-400" size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Search products by name or category..." 
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {expiredProducts.length > 0 && (
        <div className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl mb-6 flex items-start gap-3 animate-pulse">
          <div className="bg-red-500 text-white p-2 rounded-lg shadow-md">
            <Trash2 size={24} />
          </div>
          <div>
            <h3 className="text-red-800 font-black text-sm uppercase tracking-wider">🔴 Critical: Expired Products Found</h3>
            <p className="text-red-600 text-[11px] font-bold mt-0.5">
              The following products have expired: {expiredProducts.map((p: any) => p.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {nearExpiryProducts.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-100 p-4 rounded-2xl mb-6 flex items-start gap-3">
          <div className="bg-amber-500 text-white p-2 rounded-lg shadow-md">
            <Edit size={24} />
          </div>
          <div>
            <h3 className="text-amber-800 font-black text-sm uppercase tracking-wider">⚠️ Expiring Soon (Within 30 Days)</h3>
            <p className="text-amber-600 text-[11px] font-bold mt-0.5">
              Refill/Check stock for: {nearExpiryProducts.map((p: any) => p.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="p-6 text-center text-gray-500">Loading products...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name & Detail</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price (₹)</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cost (₹)</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((p: any) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded object-cover shadow-sm border border-gray-100" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No Img</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-bold text-gray-900">{p.name}</p>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">{p.category}</span>
                      {p.subCategory && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">{p.subCategory}</span>
                      )}
                      {p.mfgDate && (
                        <span className="text-[9px] text-slate-400 font-bold uppercase">MFG: {new Date(p.mfgDate).toLocaleDateString()}</span>
                      )}
                      {p.expDate && (
                        <span className={`text-[9px] font-bold uppercase ${new Date(p.expDate) < new Date() ? 'text-red-500 underline' : 'text-slate-400'}`}>
                          EXP: {new Date(p.expDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900 font-bold">₹{p.price}</p>
                    <p className="text-[10px] text-gray-500">per {p.unit || 'unit'}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-500 font-medium">₹{p.purchasePrice || 0}</p>
                    <p className="text-[10px] text-gray-400">Margin: ₹{p.price - (p.purchasePrice || 0)}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full w-fit ${p.stock <= (p.lowStockThreshold || 5) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {p.stock} {p.unit?.split(' ')[1] || p.unit}
                        </span>
                        <p className="text-[9px] text-slate-400 font-black uppercase mt-1">Alert @ {p.lowStockThreshold || 10}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/products/edit/${p._id}`} className="text-blue-500 hover:text-blue-700">
                        <Edit size={20} />
                      </Link>
                      <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
