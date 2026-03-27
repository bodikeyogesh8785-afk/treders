'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    fetch('/api/orders?t=' + Date.now()).then(res => res.json()).then(data => setOrders(data));
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      toast.success('Order status updated');
      fetchOrders();
    } else {
      toast.error('Failed to update status');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Online Orders</h1>

      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Amount</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o: any) => (
              <tr key={o._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{new Date(o.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm font-bold text-gray-900">{o.customerName}</p>
                  <p className="text-sm text-gray-500">{o.phoneNumber}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">{o.address}</p>
                </td>
                <td className="px-6 py-4">
                  <ul className="text-xs text-gray-700">
                    {o.products.map((p: any, idx: number) => (
                      <li key={idx}>• {p.product?.name} (x{p.quantity})</li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-green-700 whitespace-nowrap">₹{o.totalAmount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select 
                    value={o.status} 
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                    className={`text-sm rounded-full px-3 py-1 font-semibold border-0 outline-none
                      ${o.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${o.status === 'Completed' ? 'bg-green-100 text-green-800' : ''}
                      ${o.status === 'Cancelled' ? 'bg-red-100 text-red-800' : ''}
                    `}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-500">No online orders found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
