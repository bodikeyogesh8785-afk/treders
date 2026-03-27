'use client';

import { useEffect, useState } from 'react';

export function Footer() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, []);

  const shopName = settings?.shopName || 'SRI JAGRUTHI TRADERS';

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4 uppercase">{shopName}</h3>
          <p className="text-sm">
            Empowering modern agriculture with premium quality seeds, fertilizers, and pesticides. Your partner in sustainable farming.
          </p>
        </div>
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><a href="/" className="hover:text-green-400 transition">Home</a></li>
            <li><a href="/login" className="hover:text-green-400 transition">Admin Dashboard</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">Contact Us</h4>
          <p className="text-sm">Phone: +91 {settings?.phone || '9640799154'}</p>
          <p className="text-sm">Email: {settings?.email || 'admin@srijagruthi.com'}</p>
          <p className="text-sm">Address: {settings?.address || 'Dharmora, Mandel Lokeshwaram, District Nirmal 504104'}</p>
        </div>
      </div>
      <div className="mt-12 text-center text-sm border-t border-gray-700 pt-8 uppercase tracking-widest">
        © {new Date().getFullYear()} {shopName}. All rights reserved.
      </div>
    </footer>
  );
}
