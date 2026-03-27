'use client';

import { useEffect, useState } from 'react';
import { PackageOpen, Activity, AlertTriangle, IndianRupee } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => {
        if (!res.ok) window.location.href = '/login';
        return res.json();
      })
      .then((data) => {
        if (data.error) window.location.href = '/login'; // unauthorized
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-10">Loading Dashboard...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
            <PackageOpen size={30} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Orders</p>
            <h3 className="text-2xl font-bold text-gray-800">{data?.totalOrders || 0}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 flex items-center gap-4">
          <div className="bg-orange-100 p-4 rounded-xl text-orange-600">
            <Activity size={30} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Items in Stock</p>
            <h3 className="text-2xl font-bold text-gray-800">{data?.totalStock || 0}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 flex items-center gap-4">
          <div className="bg-emerald-100 p-4 rounded-xl text-emerald-600">
            <IndianRupee size={30} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Sales Revenue</p>
            <h3 className="text-2xl font-bold text-gray-800">₹{(data?.totalSales || 0).toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 flex items-center gap-4">
          <div className="bg-red-100 p-4 rounded-xl text-red-600">
            <AlertTriangle size={30} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Low Stock Alerts</p>
            <h3 className="text-2xl font-bold text-gray-800">{data?.lowStockAlerts?.length || 0}</h3>
          </div>
        </div>
      </div>

      {/* Alerts & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={24} />
            Low Stock Alerts
          </h2>
          {data?.lowStockAlerts?.length > 0 ? (
            <ul className="space-y-3">
              {data.lowStockAlerts.map((prod: any) => (
                <li key={prod._id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                  <span className="font-medium text-red-800">{prod.name}</span>
                  <span className="bg-red-200 text-red-900 text-xs font-bold px-3 py-1 rounded-full">
                    Only {prod.stock} left ⚠️
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">All products have sufficient stock.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Top Selling Products (System-wide)</h2>
          <ul className="space-y-3">
            {data?.topSelling?.length > 0 ? (
              data.topSelling.map((prod: any) => (
                <li key={prod._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{prod.name}</span>
                  <span className="text-sm font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                    Category: {prod.category}
                  </span>
                </li>
              ))
            ) : (
                <p className="text-gray-500">Not enough data to calculate top products.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
