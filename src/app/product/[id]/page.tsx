'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import toast from 'react-hot-toast';
import { Minus, Plus, ShoppingCart, Leaf } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  // Properly unwrap params in Next.js 15+
  const { id } = use(params);
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        toast.error('Product not found');
        router.push('/');
      });
  }, [id, router]);

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error('Product is out of stock!');
      return;
    }
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
    });
    toast.success('Added to cart!');
  };

  const handleWhatsAppOrder = () => {
    const message = `Hello, I want to order ${product.name}\nQuantity: ${quantity}\nTotal: ₹${product.price * quantity}`;
    window.open(`https://wa.me/919640799154?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-1/2 p-10 bg-gray-50 flex items-center justify-center border-r border-gray-100">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="max-w-full max-h-[500px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400 rounded-2xl">No Image</div>
            )}
          </div>
          
          {/* Details Section */}
          <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <Leaf size={20} className="text-green-600" />
              <span className="text-sm font-bold text-green-600 uppercase tracking-wider">{product.category}</span>
              {product.subCategory && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">{product.subCategory}</span>
                </>
              )}
            </div>
            
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">{product.name}</h1>
            
            <div className="flex items-end gap-2 mb-6">
              <span className="text-5xl font-black text-green-700 tracking-tight">₹{product.price}</span>
              <span className="text-lg text-gray-500 mb-1">/ {product.unit || 'unit'}</span>
            </div>

            {product.suitableCrops && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Suitable For</h3>
                <div className="flex flex-wrap gap-2">
                  {product.suitableCrops.split(',').map((crop: string) => (
                    <span key={crop} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100 uppercase">
                      {crop.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mb-8">
              <span className={`px-4 py-2 inline-flex text-sm font-bold rounded-full ${product.stock <= 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {product.stock > 0 ? `${product.stock} Units in Stock` : 'Out of Stock'}
              </span>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed text-lg italic">
                "{product.description || 'Premium quality agricultural product ensuring high yield and better crop health.'}"
              </p>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-6">
                <span className="font-semibold text-gray-700 text-lg">Quantity</span>
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 bg-gray-50 hover:bg-gray-100 transition"><Minus size={20} /></button>
                  <span className="px-6 py-2 font-bold text-lg w-16 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 bg-gray-50 hover:bg-gray-100 transition"><Plus size={20} /></button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`btn-primary py-4 px-8 text-lg flex items-center justify-center gap-3 flex-1 ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ShoppingCart size={24} /> Add to Cart
                </button>
                <button 
                  onClick={handleWhatsAppOrder}
                  className="btn-whatsapp py-4 px-8 text-lg flex-1 shadow-emerald-500/20 shadow-xl"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                  Buy via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
