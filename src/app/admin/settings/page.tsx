'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Phone, MapPin, Mail, Globe, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    phone: '',
    whatsapp: '',
    address: '',
    email: '',
    lowStockThreshold: 10,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setFormData(prev => ({ ...prev, ...data }));
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success('Settings updated successfully!');
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <SettingsIcon className="text-green-600" size={36} />
          Shop Settings
        </h1>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
              <Globe size={20} className="text-green-600" />
              General Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Shop Display Name</label>
                <input 
                  required 
                  type="text" 
                  className="input-field" 
                  value={formData.shopName} 
                  onChange={(e) => setFormData({...formData, shopName: e.target.value})} 
                  placeholder="e.g. SRI JAGRUTHI TRADERS"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Official Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="text-gray-400" size={16} />
                  </div>
                  <input 
                    required 
                    type="email" 
                    className="input-field pl-10" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    placeholder="admin@example.com"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
              <Phone size={20} className="text-green-600" />
              Contact Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="text-gray-400" size={16} />
                  </div>
                  <input 
                    required 
                    type="text" 
                    className="input-field pl-10" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    placeholder="9640799154"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">WhatsApp Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="text-green-500" size={16} />
                  </div>
                  <input 
                    required 
                    type="text" 
                    className="input-field pl-10" 
                    value={formData.whatsapp} 
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} 
                    placeholder="9640799154"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
              <Activity size={20} className="text-rose-600" />
              Inventory Alerts
            </h2>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Low Stock Reminder Limit</label>
              <div className="flex items-center gap-3">
                <input 
                  required 
                  type="number" 
                  min="0"
                  className="input-field w-32" 
                  value={formData.lowStockThreshold} 
                  onChange={(e) => setFormData({...formData, lowStockThreshold: Number(e.target.value)})} 
                />
                <p className="text-sm text-gray-500 font-medium">Show "Running Fast/Low Stock" warning when quantity is below this number.</p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
              <MapPin size={20} className="text-green-600" />
              Store Location
            </h2>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Full Address</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MapPin className="text-gray-400" size={16} />
                </div>
                <textarea 
                  required 
                  rows={3}
                  className="input-field pl-10 pt-2" 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})} 
                  placeholder="Enter full shop address..."
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end pt-6 border-t">
            <button 
              type="submit" 
              disabled={saving} 
              className="btn-primary px-12 py-4 text-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Update Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
