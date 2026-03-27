'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const router = useRouter();
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    address: '',
  });

  const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const payload = {
      ...formData,
      products: items.map(i => ({ product: i.id, quantity: i.quantity, price: i.price })),
      totalAmount
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      toast.success('Order placed successfully!');
      clearCart();
      router.push('/');
    } else {
      toast.error('Failed to place order.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Checkout</h1>
        
        <div className="bg-white rounded-2xl shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input required type="text" className="input-field" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} placeholder="Mahesh Babu" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input required type="tel" className="input-field" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} placeholder="+91 9876543210" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
              <textarea required className="input-field" rows={4} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="House details, Street, Village, Pincode..."></textarea>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-8">
              <h3 className="font-bold text-gray-900 mb-4">Payment Selection</h3>
              <div className="flex items-center gap-3 bg-white p-4 border border-green-500 rounded-lg">
                <input type="radio" checked readOnly className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300" />
                <span className="font-medium text-gray-900">Cash on Delivery (COD)</span>
              </div>
              <p className="text-sm text-gray-500 mt-2 ml-8">Pay with cash when your order arrives.</p>
            </div>

            <button type="submit" className="btn-primary w-full py-4 text-xl mt-8 shadow-green-500/30 shadow-xl">
              Confirm Order (₹{totalAmount})
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
