'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  subCategory?: string;
  unit?: string;
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (product: Product) => {
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

  const handleWhatsAppOrder = (product: Product) => {
    const message = `Hello, I want to order ${product.name}, Quantity: 1`;
    window.open(`https://wa.me/919640799154?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl font-bold text-center mb-12 text-green-800">Featured Products</h2>
      
      {loading ? (
        <div className="flex justify-center"><div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product._id} className="card flex flex-col group">
              <div className="relative h-48 sm:h-56 bg-white flex items-center justify-center p-4">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 rounded-t-xl">No Image</div>
                )}
                {product.stock <= 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    Out of Stock
                  </div>
                )}
              </div>
              
              <div className="p-5 flex-grow flex flex-col">
                <div className="flex-grow flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-700 rounded-full uppercase tracking-wider">{product.category}</span>
                    {product.subCategory && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full uppercase tracking-wider">{product.subCategory}</span>
                    )}
                  </div>
                  <Link href={`/product/${product._id}`} className="text-lg font-bold text-gray-900 hover:text-green-600 mb-2 line-clamp-1">
                    {product.name}
                  </Link>
                  <div className="flex items-center justify-between mt-auto mb-4">
                    <div className="flex flex-col">
                      <span className="text-xl font-extrabold text-green-700">₹{product.price}</span>
                      <span className="text-[10px] text-gray-400 font-medium">per {product.unit || 'unit'}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">Stock: {product.stock}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                    className={`btn-primary py-2 ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => handleWhatsAppOrder(product)}
                    className="btn-whatsapp py-2 text-sm"
                  >
                    Order via WhatsApp
                  </button>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <p className="col-span-full text-center text-gray-500 py-10">No products found. Admin can add them via dashboard.</p>
          )}
        </div>
      )}
    </div>
  );
}
