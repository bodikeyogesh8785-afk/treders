'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  const categoryMap: any = {
    seeds: 'Seeds',
    fertilizers: 'Fertilizers',
    pesticides: 'Pesticides',
    organic: 'Organic',
  };

  const currentCategory = categoryMap[slug.toLowerCase()];

  useEffect(() => {
    if (!currentCategory) {
      setLoading(false);
      return;
    }

    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((p: any) => p.category === currentCategory);
        setProducts(filtered);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load products');
        setLoading(false);
      });
  }, [currentCategory]);

  const handleAddToCart = (product: any) => {
    if (product.stock <= 0) {
      toast.error('Product is out of stock!');
      return;
    }
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    toast.success('Added to cart!');
  };

  const handleWhatsAppOrder = (product: any) => {
    const message = `Hello, I want to order ${product.name}, Quantity: 1`;
    window.open(`https://wa.me/919640799154?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 capitalize">
          {currentCategory || 'Category Not Found'}
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !currentCategory ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">This category does not exist.</p>
            <Link href="/" className="text-green-600 hover:underline mt-4 inline-block">Go back home</Link>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow border border-gray-100">
            <p className="text-xl text-gray-500">No products found in this category right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col group transition-shadow hover:shadow-xl">
                <div className="relative h-56 bg-white flex items-center justify-center p-4">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  {product.stock <= 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      Out of Stock
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-700 rounded-full uppercase tracking-wider">{product.category}</span>
                    {product.subCategory && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full uppercase tracking-wider">{product.subCategory}</span>
                    )}
                  </div>
                  <Link href={`/product/${product._id}`} className="text-lg font-bold text-gray-900 hover:text-green-600 mb-2 line-clamp-2">
                    {product.name}
                  </Link>
                  <div className="flex items-center justify-between mt-auto mb-4">
                    <div className="flex flex-col">
                      <span className="text-xl font-extrabold text-green-700">₹{product.price}</span>
                      <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">per {product.unit || 'unit'}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-md whitespace-nowrap">Stock: {product.stock > 0 ? product.stock : '0'}</span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Add to Cart
                    </button>
                    <button 
                      onClick={() => handleWhatsAppOrder(product)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                    >
                      Order via WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
