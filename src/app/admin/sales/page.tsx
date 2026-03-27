'use client';

import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { IndianRupee, Activity, Wallet, Smartphone, ShieldCheck, Plus, Loader2, CheckCircle2, Search, ChevronDown } from 'lucide-react';

export default function AdminSales() {
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [lastSale, setLastSale] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({ 
    productId: '', 
    quantitySold: '', 
    notes: '', 
    paymentMethod: '', 
    customerName: '', 
    sellingPrice: '' 
  });

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => {
      setProducts(data);
    });
    fetch('/api/settings').then(res => res.json()).then(data => {
      if (data.lowStockThreshold) setLowStockThreshold(data.lowStockThreshold);
    });
    fetchSales();

    const handleClickOutside = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
            setShowDropdown(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProductSelect = (p: any) => {
    setFormData(prev => ({ 
      ...prev, 
      productId: p._id, 
      sellingPrice: p.price.toString() 
    }));
    setSearchTerm(`${p.name} (${p.unit})`);
    setShowDropdown(false);
  };

  const fetchSales = () => {
    fetch('/api/sales?t=' + Date.now())
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                setSales(data);
                setLastUpdated(new Date().toLocaleTimeString());
            } else {
                console.error("Invalid sales data:", data);
                setSales([]);
            }
        });
  };

  const handleAddSale = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.productId || !formData.quantitySold) return toast.error('Check Product & Qty');
    if (!formData.customerName.trim()) return toast.error('Enter Customer Name');
    if (!formData.paymentMethod) return toast.error('SELECT CASH OR UPI!');

    setLoading(true);
    const body = {
        productId: formData.productId,
        quantitySold: Number(formData.quantitySold),
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
        customerName: formData.customerName.trim(),
        sellingPrice: Number(formData.sellingPrice)
    };
    
    console.log("[DEBUG] Sending Sale:", body);

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(`Logged ₹${(body.sellingPrice * body.quantitySold).toLocaleString()} as ${body.paymentMethod}`);
        setLastSale({ ...body, time: new Date().toLocaleTimeString() });
        setFilterType('All');
        fetchSales();
        setFormData({ 
            productId: '',
            quantitySold: '', 
            notes: '', 
            customerName: '',
            paymentMethod: '',
            sellingPrice: ''
        });
        setSearchTerm('');
        setShowConfirm(false);
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'Failed to save');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAmount = (records: any[]) => {
    return records.reduce((acc, s) => {
      const sellPrice = Number(s.sellingPrice || s.product?.price || 0);
      return acc + (sellPrice * (Number(s.quantitySold) || 0));
    }, 0);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    if (!d1 || isNaN(d1.getTime()) || !d2 || isNaN(d2.getTime())) return false;
    return d1.toDateString() === d2.toDateString();
  };

  const now = new Date();
  const todayRecords = Array.isArray(sales) ? sales.filter((s: any) => {
    const d = new Date(s.saleDate || s.createdAt);
    return isSameDay(d, now);
  }) : [];

  const todayCash = todayRecords.reduce((acc: number, s: any) => {
    const m = String(s.paymentMethod || 'Cash').trim().toUpperCase();
    const notes = String(s.notes || '').toLowerCase();
    const name = String(s.customerName || '').toLowerCase();
    if (m === 'CASH' && !notes.includes('upi') && !name.includes('upi')) return acc + (Number(s.sellingPrice || s.product?.price || 0) * (Number(s.quantitySold) || 0));
    return acc;
  }, 0);

  const todayUPI = todayRecords.reduce((acc: number, s: any) => {
    const m = String(s.paymentMethod || '').trim().toUpperCase();
    const notes = String(s.notes || '').toLowerCase();
    const name = String(s.customerName || '').toLowerCase();
    if (m === 'UPI' || notes.includes('upi') || name.includes('upi')) return acc + (Number(s.sellingPrice || s.product?.price || 0) * (Number(s.quantitySold) || 0));
    return acc;
  }, 0);

  const totalToday = todayCash + todayUPI;
  
  const filteredSales = (filterType === 'All' ? sales : sales.filter((s: any) => {
    const m = String(s.paymentMethod || 'Cash').trim().toUpperCase();
    return m === filterType.toUpperCase();
  })) || [];

  const currentTotal = Number(formData.sellingPrice || 0) * Number(formData.quantitySold || 0);

  const filteredProducts = products.filter(p => {
    const name = (p.name || '').toLowerCase();
    const unit = (p.unit || '').toLowerCase();
    const search = (searchTerm || '').toLowerCase();
    return name.includes(search) || unit.includes(search);
  });

  return (
    <div className="space-y-4 pb-6 bg-[#f8fafc] min-h-screen p-2 md:p-4 lg:p-5">
      {/* Header - Compact */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            SALES DASHBOARD <Activity className="text-indigo-600 w-6 h-6" />
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">SRI JAGRUTHI TRADERS Official Records</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
            {['All', 'Cash', 'UPI'].map(f => (
                <button key={f} onClick={() => setFilterType(f)} className={`text-[10px] font-black px-5 py-2 rounded-xl uppercase transition-all ${filterType === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}>
                    {f === 'All' ? 'Full Data' : f}
                </button>
            ))}
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-indigo-950 p-5 lg:p-6 rounded-[1.5rem] shadow-xl text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><IndianRupee size={80} /></div>
          <p className="text-indigo-400 font-bold uppercase tracking-widest text-[8px] mb-1">Today's Revenue (IST)</p>
          <h2 className="text-3xl lg:text-4xl font-black mb-1 flex items-center gap-1">
            <span className="text-lg font-light opacity-30">₹</span>{totalToday.toLocaleString()}
          </h2>
          <p className="text-[8px] text-white/30 font-black uppercase mb-6">Synced: {lastUpdated}</p>
          <div className="grid grid-cols-2 gap-2 mt-2 border-t border-white/5 pt-4">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col justify-center">
              <p className="text-[8px] text-orange-400 uppercase font-black tracking-widest mb-0.5">CASH</p>
              <p className="text-lg font-black">₹{todayCash.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col justify-center">
              <p className="text-[8px] text-blue-400 uppercase font-black tracking-widest mb-0.5">UPI</p>
              <p className="text-lg font-black">₹{todayUPI.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 lg:p-6 rounded-[1.5rem] shadow-md border border-slate-100 flex flex-col justify-between">
          <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit mb-3">Weekly Stats</span>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">₹{calculateTotalAmount(sales.filter((s: any) => new Date(s.saleDate || s.createdAt).getTime() > Date.now() - 7*24*60*60*1000)).toLocaleString()}</h3>
          <div className="mt-6 flex items-end gap-1 h-8">
            {[45, 75, 55, 95, 65, 85, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-emerald-500/10 rounded-sm relative group overflow-hidden">
                <div className="absolute bottom-0 w-full bg-emerald-500 rounded-sm transition-all duration-700" style={{ height: `${h}%` }}></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 lg:p-6 rounded-[1.5rem] shadow-md border border-slate-100">
          <span className="bg-fuchsia-100 text-fuchsia-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest block w-fit mb-3">Goal Progress</span>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Today: ₹{totalToday.toLocaleString()}</h3>
          <div className="mt-8">
            <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase mb-1.5">
                <span>Targets Met</span>
                <span>45% COMPLETION</span>
            </div>
            <div className="overflow-hidden rounded-full bg-slate-50 h-2 border border-slate-100 shadow-inner">
                <div className="h-full bg-indigo-600 rounded-full shadow-lg" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* NEW LOG FORM WITH SEARCHABLE PRODUCT */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white p-5 lg:p-6 rounded-[1.5rem] shadow-2xl border border-slate-100 sticky top-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Plus size={28} strokeWidth={4} />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">New Transaction</h2>
          </div>

          <form className="space-y-6">
            <div className="space-y-5">
                {/* STEP 1: PAYMENT MODE */}
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest text-center">Payment Mode <span className="text-rose-500 font-black">*</span></p>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            type="button" 
                            onClick={() => setFormData(prev => ({...prev, paymentMethod: 'Cash'}))} 
                            className={`flex flex-col items-center justify-center py-6 rounded-2xl border-2 transition-all gap-2 relative ${formData.paymentMethod === 'Cash' ? 'bg-orange-500 border-orange-200 text-white shadow-xl scale-105 select-none font-bold' : 'bg-white border-white text-slate-300'}`}
                        >
                            {formData.paymentMethod === 'Cash' && <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-white" />}
                            <Wallet size={24} />
                            <span className="text-[10px] font-black uppercase">CASH</span>
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setFormData(prev => ({...prev, paymentMethod: 'UPI'}))} 
                            className={`flex flex-col items-center justify-center py-6 rounded-2xl border-2 transition-all gap-2 relative ${formData.paymentMethod === 'UPI' ? 'bg-blue-600 border-blue-200 text-white shadow-xl scale-105 select-none font-bold' : 'bg-white border-white text-slate-300'}`}
                        >
                            {formData.paymentMethod === 'UPI' && <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-white" />}
                            <Smartphone size={24} />
                            <span className="text-[10px] font-black uppercase">UPI</span>
                        </button>
                    </div>
                </div>

                {/* SEARCHABLE PRODUCT SELECTOR */}
                <div className="relative" ref={dropdownRef}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest px-2">Select Item & Qty-Unit</label>
                    <div className="relative group">
                        <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-base font-bold text-slate-900 focus:bg-white focus:border-indigo-600 transition-all outline-none"
                            placeholder="Search product (e.g. Terminator, 500ml)"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
                    </div>

                    {showDropdown && (
                        <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((p: any) => (
                                    <button
                                        key={p._id}
                                        type="button"
                                        onClick={() => handleProductSelect(p)}
                                        className="w-full text-left px-5 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-none group flex justify-between items-center transition-colors"
                                    >
                                        <div>
                                            <p className="text-sm font-black text-slate-800">{p.name}</p>
                                            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Qty: {p.unit}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xs font-black ${p.stock <= 0 ? 'text-rose-600' : p.stock <= (p.lowStockThreshold || lowStockThreshold) ? 'text-orange-500' : 'text-emerald-600'}`}>
                                                ₹{p.price}
                                            </p>
                                            <div className="flex flex-col items-end">
                                                <p className={`text-[10px] font-bold uppercase ${p.stock <= 0 ? 'text-rose-600' : p.stock <= (p.lowStockThreshold || lowStockThreshold) ? 'text-orange-500' : 'text-slate-400'}`}>
                                                    Stock: {p.stock} {p.unit}
                                                </p>
                                                {p.stock <= 0 ? (
                                                    <span className="text-[8px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full mt-1 uppercase heartbeat">OUT OF STOCK</span>
                                                ) : p.stock <= (p.lowStockThreshold || lowStockThreshold) && (
                                                    <span className="text-[8px] font-black bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full mt-1 uppercase">RUNNING FAST</span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-10 text-center">
                                    <p className="text-slate-400 text-xs font-black uppercase">Product not found</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest px-2">Selling Price</label>
                    <input required type="number" className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-lg font-black text-slate-900 focus:border-indigo-600 transition-all outline-none shadow-sm" value={formData.sellingPrice} onChange={(e) => setFormData(p => ({...p, sellingPrice: e.target.value}))} />
                    </div>
                    <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest px-2">Quantity (Units)</label>
                    <input required type="number" min="1" className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-lg font-black text-slate-900 focus:border-indigo-600 transition-all outline-none shadow-sm" value={formData.quantitySold} onChange={(e) => setFormData(p => ({...p, quantitySold: e.target.value}))} />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest px-2">Client Name <span className="text-rose-500 font-black">*</span></label>
                    <input required type="text" className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-base font-bold text-slate-900 focus:border-indigo-600 transition-all outline-none shadow-sm" value={formData.customerName} onChange={(e) => setFormData(p => ({...p, customerName: e.target.value}))} placeholder="Whom are you selling?" />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest px-2 italic">Entry Notes</label>
                    <input className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-600 transition-all outline-none" value={formData.notes} onChange={(e) => setFormData(p => ({...p, notes: e.target.value}))} placeholder="Any specific details..." />
                </div>
            </div>
            
            <div className={`p-6 rounded-[2rem] text-center text-white relative overflow-hidden group transition-all duration-500 shadow-xl ${formData.paymentMethod === 'UPI' ? 'bg-blue-900' : formData.paymentMethod === 'Cash' ? 'bg-orange-950' : 'bg-slate-200'}`}>
                <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">Verify Total Bill</p>
                <div className="flex items-center justify-center gap-1">
                    <IndianRupee size={20} className="mb-1" />
                    <p className="text-3xl font-black italic tracking-tighter">{currentTotal.toLocaleString()}</p>
                </div>
                {formData.paymentMethod && (
                    <p className={`text-[9px] font-black uppercase px-6 py-2 rounded-full w-fit mx-auto mt-4 shadow-lg ${formData.paymentMethod === 'UPI' ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white'}`}>
                         LOG AS {formData.paymentMethod}
                    </p>
                )}
            </div>

            {lastSale && (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl animate-in zoom-in-95 duration-500">
                    <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1 mb-1">
                        <CheckCircle2 size={12} /> Last Entry Success
                    </p>
                    <div className="flex justify-between items-center">
                        <p className="text-xs font-black text-slate-900 uppercase">{lastSale.customerName}</p>
                        <p className="text-xs font-black text-emerald-700">₹{(lastSale.sellingPrice * lastSale.quantitySold).toLocaleString()} ({lastSale.paymentMethod})</p>
                    </div>
                </div>
            )}

            <button 
                disabled={loading || !formData.paymentMethod || !formData.productId} 
                type="button"
                onClick={() => setShowConfirm(true)}
                className={`w-full py-6 rounded-[2.5rem] text-xl font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-20 disabled:scale-100 disabled:shadow-none ${formData.paymentMethod === 'UPI' ? 'bg-blue-600' : 'bg-slate-900'} text-white overflow-hidden`}
            >
                {loading ? <Loader2 className="animate-spin w-8 h-8 text-indigo-400" /> : <>LOG ENTRY <Plus strokeWidth={5} size={32} /></>}
            </button>

          </form>

          {showConfirm && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                  <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-300">
                      <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${formData.paymentMethod === 'UPI' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                          {formData.paymentMethod === 'UPI' ? <Smartphone size={40} /> : <Wallet size={40} />}
                      </div>
                      <div>
                          <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase">Confirm Payment</h3>
                          <p className="text-slate-500 text-sm font-medium">Are you sure this is a <span className={`font-black uppercase ${formData.paymentMethod === 'UPI' ? 'text-blue-600' : 'text-orange-600'}`}>{formData.paymentMethod}</span> transaction for <span className="text-slate-900 font-black">₹{currentTotal.toLocaleString()}</span>?</p>
                      </div>
                      <div className="flex flex-col gap-3">
                          <button type="button" onClick={() => handleAddSale()} className={`w-full py-5 rounded-2xl text-white font-black uppercase tracking-widest shadow-lg ${formData.paymentMethod === 'UPI' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
                              YES, LOG IT
                          </button>
                          <button type="button" onClick={() => setShowConfirm(false)} className="w-full py-5 rounded-2xl bg-slate-100 text-slate-400 font-bold uppercase tracking-widest hover:bg-slate-200">
                              NO, GO BACK
                          </button>
                      </div>
                  </div>
              </div>
          )}
        </div>

        {/* Business Log Table - Dense */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-[1.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/10">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                Daily Sales Log <ShieldCheck className="text-emerald-500" />
            </h2>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[900px] custom-scrollbar">
            <table className="min-w-full border-collapse">
              <thead className="bg-[#fcfdff] sticky top-0 z-10 backdrop-blur-3xl border-b border-slate-100 shadow-sm">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Mode</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Name</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Details</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((s: any) => {
                  const sellPrice = Number(s.sellingPrice || s.product?.price || 0);
                  const total = sellPrice * s.quantitySold;
                  const payMethod = String(s.paymentMethod || 'Cash').trim().toUpperCase();
                  return (
                    <tr key={s._id} className="group hover:bg-indigo-50/10 transition-all duration-300">
                      <td className="px-6 py-4">
                        <p className="text-xs font-black text-slate-900 leading-none mb-1.5">{new Date(s.saleDate || s.createdAt).toLocaleDateString([], {day:'numeric', month:'short'})}</p>
                        <span className={`inline-flex items-center gap-1.5 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${payMethod === 'UPI' ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white'}`}>
                          {payMethod === 'UPI' ? <Smartphone size={8} strokeWidth={4} /> : <Wallet size={8} strokeWidth={4} />}
                          {payMethod}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-black text-slate-900 tracking-tight leading-tight uppercase">{s.customerName}</p>
                        {s.notes && <p className="text-[9px] text-slate-400 font-bold italic mt-1 line-clamp-1 opacity-70">"{s.notes}"</p>}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-black text-slate-900 truncate max-w-[150px] mb-0.5">{s.product?.name || '---'}</p>
                        <p className="text-[10px] text-indigo-600 font-black bg-indigo-50 px-2 py-0.5 rounded-lg w-fit flex items-center gap-1">
                             {s.quantitySold} SOLD
                             <span className="text-[8px] text-indigo-400">({s.product?.unit || 'Item'})</span>
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <p className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-all origin-right tracking-tight">₹{total.toLocaleString()}</p>
                        <p className="text-[9px] text-slate-300 font-black uppercase mt-0.5">@ ₹{sellPrice.toLocaleString()}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredSales.length === 0 && (
              <div className="text-center py-40 bg-white">
                <Activity size={60} className="text-slate-100 mx-auto mb-6" />
                <p className="text-slate-200 font-black text-2xl uppercase tracking-[0.2em]">The vault is empty.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 40px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
