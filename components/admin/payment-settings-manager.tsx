'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard, Smartphone, Banknote, QrCode, Plus, Trash2, 
  Save, Check, AlertCircle, RefreshCw, ShieldCheck, Settings2,
  Package, DollarSign, Percent, Sparkles, HelpCircle, CheckCircle2
} from 'lucide-react';

interface AdditionalCharge {
  id: string;
  name: string;
  description?: string;
  amount: number;
  type: 'FLAT' | 'PERCENT';
  isOptional: boolean;
  defaultSelected: boolean;
  enabled: boolean;
}

interface CustomPaymentMethod {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  extraFee: number;
  enabled: boolean;
}

interface PaymentSettingsState {
  razorpay: {
    enabled: boolean;
    title: string;
    description: string;
    badge: string;
    discountPercent: number;
    minOrder: number;
  };
  cod: {
    enabled: boolean;
    title: string;
    description: string;
    extraFee: number;
    minOrder: number;
    maxOrder: number;
    allowedRegions: string;
  };
  directUpi: {
    enabled: boolean;
    title: string;
    description: string;
    upiId: string;
    payeeName: string;
    qrImageUrl?: string;
    discountPercent: number;
  };
  customMethods: CustomPaymentMethod[];
  additionalCharges: AdditionalCharge[];
  verificationSettings: {
    requireDoubleCheck: boolean;
    enableWhatsAppUpdates: boolean;
    allowCustomerNotes: boolean;
  };
}

export default function PaymentSettingsManager() {
  const [settings, setSettings] = useState<PaymentSettingsState>({
    razorpay: {
      enabled: true,
      title: 'Razorpay Online Gateway',
      description: 'UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, NetBanking, EMI & Wallets',
      badge: 'Recommended • Fast & Secure',
      discountPercent: 0,
      minOrder: 0,
    },
    cod: {
      enabled: true,
      title: 'Cash on Delivery (COD)',
      description: 'Pay in cash upon doorstep delivery in Hyderabad & Uppal region',
      extraFee: 0,
      minOrder: 0,
      maxOrder: 25000,
      allowedRegions: 'Hyderabad, Uppal & All India',
    },
    directUpi: {
      enabled: true,
      title: 'Direct UPI QR Scan & Pay',
      description: 'Scan SVT Official QR via PhonePe, GPay, Paytm or BHIM with instant zero-fee settlement',
      upiId: '9515273464@ybl',
      payeeName: 'Sidhi Vinayaka Traders',
      qrImageUrl: '',
      discountPercent: 0,
    },
    customMethods: [],
    additionalCharges: [],
    verificationSettings: {
      requireDoubleCheck: true,
      enableWhatsAppUpdates: true,
      allowCustomerNotes: true,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // New custom charge draft
  const [showAddChargeModal, setShowAddChargeModal] = useState(false);
  const [newCharge, setNewCharge] = useState<AdditionalCharge>({
    id: '',
    name: '',
    description: '',
    amount: 0,
    type: 'FLAT',
    isOptional: true,
    defaultSelected: false,
    enabled: true,
  });

  // New custom payment method draft
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [newMethod, setNewMethod] = useState<CustomPaymentMethod>({
    id: '',
    name: '',
    description: '',
    instructions: '',
    extraFee: 0,
    enabled: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/payment-settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err: any) {
      setErrorMsg('Failed to load payment settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Payment settings & dynamic charges successfully saved and deployed live!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.error || 'Failed to save settings.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating payment settings.');
    } finally {
      setSaving(false);
    }
  };

  // Additional Charges Handlers
  const handleAddCharge = () => {
    if (!newCharge.name.trim()) return;
    const chargeId = newCharge.id.trim() || `charge_${Date.now()}`;
    setSettings({
      ...settings,
      additionalCharges: [
        ...(settings.additionalCharges || []),
        { ...newCharge, id: chargeId },
      ],
    });
    setNewCharge({
      id: '',
      name: '',
      description: '',
      amount: 0,
      type: 'FLAT',
      isOptional: true,
      defaultSelected: false,
      enabled: true,
    });
    setShowAddChargeModal(false);
  };

  const handleDeleteCharge = (id: string) => {
    setSettings({
      ...settings,
      additionalCharges: (settings.additionalCharges || []).filter((c) => c.id !== id),
    });
  };

  const handleToggleCharge = (id: string) => {
    setSettings({
      ...settings,
      additionalCharges: (settings.additionalCharges || []).map((c) =>
        c.id === id ? { ...c, enabled: !c.enabled } : c
      ),
    });
  };

  // Custom Payment Methods Handlers
  const handleAddCustomMethod = () => {
    if (!newMethod.name.trim()) return;
    const methodId = newMethod.id.trim() || `custom_${Date.now()}`;
    setSettings({
      ...settings,
      customMethods: [
        ...(settings.customMethods || []),
        { ...newMethod, id: methodId },
      ],
    });
    setNewMethod({
      id: '',
      name: '',
      description: '',
      instructions: '',
      extraFee: 0,
      enabled: true,
    });
    setShowAddMethodModal(false);
  };

  const handleDeleteCustomMethod = (id: string) => {
    setSettings({
      ...settings,
      customMethods: (settings.customMethods || []).filter((m) => m.id !== id),
    });
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#D4AF37]" />
        <p className="text-xs font-bold uppercase tracking-wider">Loading Payment & Charges Suite...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Save Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0E1726]/90 p-5 sm:p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-black uppercase tracking-wider mb-1">
            <Settings2 className="w-3.5 h-3.5" />
            <span>Super Admin Payment Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-white">
            Payment Gateways & Dynamic Surcharges
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Enable or disable gateways, set custom handling fees, add extra packaging/service charges, and configure checkout verification.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8972E] hover:brightness-110 text-navy-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-elevated flex items-center space-x-2 transition-all shrink-0 cursor-pointer"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Publish Live</span>
            </>
          )}
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-3 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-3 shadow-lg animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* GRID SECTION: Gateways */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GATEWAY 1: Razorpay Online */}
        <div className={`p-6 rounded-3xl border transition-all space-y-4 ${
          settings.razorpay.enabled ? 'bg-[#0E1726] border-[#D4AF37]/50 shadow-xl' : 'bg-navy-950/60 border-white/10 opacity-75'
        }`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2.5">
              <Smartphone className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-sm font-black uppercase tracking-wide text-white">Razorpay Online</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.razorpay.enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  razorpay: { ...settings.razorpay, enabled: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Display Title</label>
              <input
                type="text"
                value={settings.razorpay.title}
                onChange={(e) => setSettings({
                  ...settings,
                  razorpay: { ...settings.razorpay, title: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white font-medium focus:border-[#D4AF37] outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Badge Tag</label>
              <input
                type="text"
                value={settings.razorpay.badge}
                onChange={(e) => setSettings({
                  ...settings,
                  razorpay: { ...settings.razorpay, badge: e.target.value }
                })}
                placeholder="Recommended • Instant & Fast"
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white font-medium focus:border-[#D4AF37] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Instant Discount (%)</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={settings.razorpay.discountPercent}
                  onChange={(e) => setSettings({
                    ...settings,
                    razorpay: { ...settings.razorpay, discountPercent: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-emerald-400 font-bold font-mono focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Min Order (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={settings.razorpay.minOrder}
                  onChange={(e) => setSettings({
                    ...settings,
                    razorpay: { ...settings.razorpay, minOrder: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white font-mono focus:border-[#D4AF37] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Customer Description</label>
              <textarea
                rows={2}
                value={settings.razorpay.description}
                onChange={(e) => setSettings({
                  ...settings,
                  razorpay: { ...settings.razorpay, description: e.target.value }
                })}
                className="w-full px-3 py-1.5 rounded-xl bg-navy-950 border border-white/10 text-slate-300 text-[11px] focus:border-[#D4AF37] outline-none"
              />
            </div>
          </div>
        </div>

        {/* GATEWAY 2: Cash on Delivery (COD) */}
        <div className={`p-6 rounded-3xl border transition-all space-y-4 ${
          settings.cod.enabled ? 'bg-[#0E1726] border-[#D4AF37]/50 shadow-xl' : 'bg-navy-950/60 border-white/10 opacity-75'
        }`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2.5">
              <Banknote className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-sm font-black uppercase tracking-wide text-white">Cash on Delivery (COD)</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.cod.enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  cod: { ...settings.cod, enabled: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Display Title</label>
              <input
                type="text"
                value={settings.cod.title}
                onChange={(e) => setSettings({
                  ...settings,
                  cod: { ...settings.cod, title: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white font-medium focus:border-[#D4AF37] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">COD Handling Fee (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={settings.cod.extraFee}
                  onChange={(e) => setSettings({
                    ...settings,
                    cod: { ...settings.cod, extraFee: Number(e.target.value) }
                  })}
                  placeholder="e.g. 0 or 49"
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-[#D4AF37] font-bold font-mono focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Max Order Limit (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={settings.cod.maxOrder}
                  onChange={(e) => setSettings({
                    ...settings,
                    cod: { ...settings.cod, maxOrder: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white font-mono focus:border-[#D4AF37] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Allowed Delivery Region</label>
              <input
                type="text"
                value={settings.cod.allowedRegions}
                onChange={(e) => setSettings({
                  ...settings,
                  cod: { ...settings.cod, allowedRegions: e.target.value }
                })}
                placeholder="e.g. Hyderabad, Uppal & All India"
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white text-xs focus:border-[#D4AF37] outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Customer Description</label>
              <textarea
                rows={2}
                value={settings.cod.description}
                onChange={(e) => setSettings({
                  ...settings,
                  cod: { ...settings.cod, description: e.target.value }
                })}
                className="w-full px-3 py-1.5 rounded-xl bg-navy-950 border border-white/10 text-slate-300 text-[11px] focus:border-[#D4AF37] outline-none"
              />
            </div>
          </div>
        </div>

        {/* GATEWAY 3: Direct UPI QR Scan */}
        <div className={`p-6 rounded-3xl border transition-all space-y-4 ${
          settings.directUpi.enabled ? 'bg-[#0E1726] border-[#D4AF37]/50 shadow-xl' : 'bg-navy-950/60 border-white/10 opacity-75'
        }`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2.5">
              <QrCode className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-sm font-black uppercase tracking-wide text-white">Direct UPI QR</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.directUpi.enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  directUpi: { ...settings.directUpi, enabled: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">SVT Merchant UPI ID</label>
              <input
                type="text"
                value={settings.directUpi.upiId}
                onChange={(e) => setSettings({
                  ...settings,
                  directUpi: { ...settings.directUpi, upiId: e.target.value }
                })}
                placeholder="e.g. 9515273464@ybl"
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-[#D4AF37] font-mono font-bold focus:border-[#D4AF37] outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Account Holder / Payee Name</label>
              <input
                type="text"
                value={settings.directUpi.payeeName}
                onChange={(e) => setSettings({
                  ...settings,
                  directUpi: { ...settings.directUpi, payeeName: e.target.value }
                })}
                placeholder="Sidhi Vinayaka Traders"
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white font-medium focus:border-[#D4AF37] outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Direct UPI Instant Discount (%)</label>
              <input
                type="number"
                min={0}
                max={50}
                value={settings.directUpi.discountPercent}
                onChange={(e) => setSettings({
                  ...settings,
                  directUpi: { ...settings.directUpi, discountPercent: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-emerald-400 font-bold font-mono focus:border-[#D4AF37] outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">QR Code Image URL (Optional)</label>
              <input
                type="text"
                value={settings.directUpi.qrImageUrl || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  directUpi: { ...settings.directUpi, qrImageUrl: e.target.value }
                })}
                placeholder="https://... or /images/..."
                className="w-full px-3 py-1.5 rounded-xl bg-navy-950 border border-white/10 text-slate-300 text-xs focus:border-[#D4AF37] outline-none font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: DYNAMIC ADDITIONAL CHARGES & SURCHARGES MANAGER */}
      <div className="bg-[#0E1726] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-base font-black font-heading text-white">
                Dynamic Additional Charges & Packaging Fees
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Add or remove custom handling charges, gift wrap options, taxes, or express delivery surcharges dynamically.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddChargeModal(true)}
            className="px-4 py-2.5 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] border border-[#D4AF37]/40 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Charge / Surcharge</span>
          </button>
        </div>

        {/* Charge Items List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(!settings.additionalCharges || settings.additionalCharges.length === 0) ? (
            <div className="col-span-full p-8 text-center bg-navy-950/60 rounded-2xl border border-dashed border-white/10 text-slate-400 text-xs">
              No additional charges configured. Click &quot;Add New Charge&quot; above to create packaging or service fees.
            </div>
          ) : (
            settings.additionalCharges.map((charge) => (
              <div
                key={charge.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 relative ${
                  charge.enabled ? 'bg-navy-950 border-[#D4AF37]/40' : 'bg-navy-950/40 border-white/10 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white truncate max-w-[170px]">{charge.name}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleToggleCharge(charge.id)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                        charge.enabled
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-white/10'
                      }`}
                    >
                      {charge.enabled ? 'Active' : 'Disabled'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCharge(charge.id)}
                      className="text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-950/50 transition-colors"
                      title="Delete Charge"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <span className="text-slate-400">Amount / Rate</span>
                  <span className="font-bold text-[#D4AF37] font-mono">
                    {charge.amount === 0 ? 'FREE' : charge.type === 'PERCENT' ? `${charge.amount}%` : `₹${charge.amount}`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Customer Choice</span>
                  <span className="font-semibold text-slate-300">
                    {charge.isOptional ? 'Optional (Opt-in Checkbox)' : 'Mandatory Auto-applied'}
                  </span>
                </div>

                {charge.description && (
                  <p className="text-[10px] text-slate-400 line-clamp-2 bg-navy-900/60 p-2 rounded-lg">
                    {charge.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 3: CHECKOUT VERIFICATION & ORDER SECURITY SETTINGS */}
      <div className="bg-[#0E1726] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center space-x-2.5 border-b border-white/10 pb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-base font-black font-heading text-white">
              Customer Contact Verification & Dispatch Protocol
            </h3>
            <p className="text-xs text-slate-400">
              Configure frictionless checkout confirmation replacing phone SMS OTP.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-navy-950 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Smart Double-Check Modal</span>
              <input
                type="checkbox"
                checked={settings.verificationSettings.requireDoubleCheck}
                onChange={(e) => setSettings({
                  ...settings,
                  verificationSettings: {
                    ...settings.verificationSettings,
                    requireDoubleCheck: e.target.checked
                  }
                })}
                className="rounded border-white/20 text-[#D4AF37] focus:ring-[#D4AF37] bg-navy-900"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Pops up interactive contact & address review before payment to prevent phone & delivery typos.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-navy-950 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">WhatsApp Live Tracking</span>
              <input
                type="checkbox"
                checked={settings.verificationSettings.enableWhatsAppUpdates}
                onChange={(e) => setSettings({
                  ...settings,
                  verificationSettings: {
                    ...settings.verificationSettings,
                    enableWhatsAppUpdates: e.target.checked
                  }
                })}
                className="rounded border-white/20 text-[#D4AF37] focus:ring-[#D4AF37] bg-navy-900"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Allows customers to opt-in for automated WhatsApp dispatch and courier tracking updates.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-navy-950 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Customer Order Notes</span>
              <input
                type="checkbox"
                checked={settings.verificationSettings.allowCustomerNotes}
                onChange={(e) => setSettings({
                  ...settings,
                  verificationSettings: {
                    ...settings.verificationSettings,
                    allowCustomerNotes: e.target.checked
                  }
                })}
                className="rounded border-white/20 text-[#D4AF37] focus:ring-[#D4AF37] bg-navy-900"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Enables special instructions / landmark comments during checkout.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL: ADD NEW ADDITIONAL CHARGE */}
      {showAddChargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0E1726] border border-[#D4AF37]/50 rounded-3xl p-6 text-slate-100 shadow-2xl space-y-5">
            <h3 className="text-lg font-black font-heading text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#D4AF37]" />
              <span>Create Additional Surcharge / Charge</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Charge Name / Service Title *</label>
                <input
                  type="text"
                  required
                  value={newCharge.name}
                  onChange={(e) => setNewCharge({ ...newCharge, name: e.target.value })}
                  placeholder="e.g. Festive Gold Tin Box Packaging"
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Amount *</label>
                  <input
                    type="number"
                    min={0}
                    value={newCharge.amount}
                    onChange={(e) => setNewCharge({ ...newCharge, amount: Number(e.target.value) })}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-[#D4AF37] font-bold font-mono focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Calculation Type</label>
                  <select
                    value={newCharge.type}
                    onChange={(e) => setNewCharge({ ...newCharge, type: e.target.value as 'FLAT' | 'PERCENT' })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white focus:border-[#D4AF37] outline-none"
                  >
                    <option value="FLAT">Flat Fee (₹)</option>
                    <option value="PERCENT">Percentage (%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Description (Shown to Customer)</label>
                <input
                  type="text"
                  value={newCharge.description}
                  onChange={(e) => setNewCharge({ ...newCharge, description: e.target.value })}
                  placeholder="e.g. Airtight luxury festive tin box for gifting"
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-slate-300 focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newCharge.isOptional}
                    onChange={(e) => setNewCharge({ ...newCharge, isOptional: e.target.checked })}
                    className="rounded border-white/20 text-[#D4AF37] focus:ring-[#D4AF37] bg-navy-950"
                  />
                  <span className="text-slate-200">Optional for Customer (Opt-in Checkbox)</span>
                </label>

                {newCharge.isOptional && (
                  <label className="flex items-center space-x-2 cursor-pointer select-none pl-6">
                    <input
                      type="checkbox"
                      checked={newCharge.defaultSelected}
                      onChange={(e) => setNewCharge({ ...newCharge, defaultSelected: e.target.checked })}
                      className="rounded border-white/20 text-[#D4AF37] focus:ring-[#D4AF37] bg-navy-950"
                    />
                    <span className="text-slate-400">Pre-select by default</span>
                  </label>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddChargeModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCharge}
                className="px-5 py-2 rounded-xl gold-cta-button text-navy-950 font-black text-xs uppercase tracking-wider"
              >
                Add Charge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
