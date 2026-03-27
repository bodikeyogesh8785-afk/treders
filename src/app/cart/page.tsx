'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, []);

  const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const whatsappNumber = settings?.whatsapp || '919640799154';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>
        
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <p className="text-gray-500 mb-6 text-lg">Your cart is empty.</p>
            <Link href="/" className="btn-primary">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-500">Image</div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-green-700 font-bold">₹{item.price}</p>
                        <span className="text-xs text-gray-400 font-medium">per {item.unit || 'unit'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-2 hover:bg-gray-100"><Minus size={16} /></button>
                      <span className="px-4 py-2 font-medium bg-gray-50">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-gray-100"><Plus size={16} /></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 transition">
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded-2xl shadow p-6 h-fit sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              <div className="flex justify-between mb-4 text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-semibold text-gray-900">₹{totalAmount}</span>
              </div>
              <hr className="my-4 border-gray-200" />
              <div className="flex justify-between mb-8">
                <span className="text-lg font-bold text-gray-900">Total Price</span>
                <span className="text-2xl font-extrabold text-green-700">₹{totalAmount}</span>
              </div>
              
              <Link href="/checkout" className="btn-primary w-full text-center block py-3 text-lg font-bold mb-4">
                Proceed to Checkout
              </Link>
              <button 
                onClick={() => {
                  const message = `Hello, I want to order the following items from your shop:\n\n${items.map(i => `- ${i.name} (${i.unit}) x${i.quantity}`).join('\n')}\n\nTotal: ₹${totalAmount}`;
                  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
                }}
                className="btn-whatsapp w-full block py-3 text-lg shadow-emerald-500/20 shadow-xl"
              >
                Order via WhatsApp
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
