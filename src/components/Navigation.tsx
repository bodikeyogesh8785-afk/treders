'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Sprout, User } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export function Navigation() {
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, []);

  const shopName = settings?.shopName || 'SRI JAGRUTHI TRADERS';

  return (
    <nav className="bg-green-700 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Sprout size={28} className="text-yellow-400" />
            <span className="uppercase">{shopName}</span>
          </Link>

          <div className="hidden md:flex gap-6">
            <Link href="/category/seeds" className="hover:text-yellow-400 transition">Seeds</Link>
            <Link href="/category/fertilizers" className="hover:text-yellow-400 transition">Fertilizers</Link>
            <Link href="/category/pesticides" className="hover:text-yellow-400 transition">Pesticides</Link>
            <Link href="/category/organic" className="hover:text-yellow-400 transition">Organic</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-yellow-400 transition">
              <User size={24} />
            </Link>
            <Link href="/cart" className="relative hover:text-yellow-400 transition">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
