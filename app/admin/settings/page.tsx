'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PushNotificationManager from '@/components/push-notification-manager';
import PaymentSettingsManager from '@/components/admin/payment-settings-manager';
import { ArrowLeft, Bell, Smartphone, ShieldCheck, CreditCard, Sliders } from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'payments' | 'notifications'>('payments');

  return (
    <div className="bg-[#070D18] min-h-screen p-6 sm:p-10 space-y-6 text-slate-100">
      <div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center space-x-2 text-xs font-bold text-[#D4AF37] hover:underline mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order Management Dashboard</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white">
              Admin Control & Store Settings
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure payment methods, dynamic handling surcharges, and instant mobile alerts for SVT Uppal.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-navy-900/90 p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'payments'
                  ? 'bg-[#D4AF37] text-navy-950 font-black shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Payment & Surcharges</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'notifications'
                  ? 'bg-[#D4AF37] text-navy-950 font-black shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Push Notifications</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'payments' && (
        <div className="pt-2">
          <PaymentSettingsManager />
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          <div className="lg:col-span-7 space-y-6">
            <PushNotificationManager />
          </div>

          <div className="lg:col-span-5 bg-[#0E1726] rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="text-base font-bold font-heading text-white">
              Registered Admin Devices
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-navy-950 rounded-xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-[#D4AF37]" />
                  <div>
                    <p className="font-bold text-white">Ravindra&apos;s Mobile Terminal (Primary)</p>
                    <p className="text-[10px] text-slate-400">Active Push Token • Instant Order Sound</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 font-bold rounded-full text-[10px] border border-emerald-500/30">
                  Active
                </span>
              </div>

              <div className="p-3 bg-navy-950 rounded-xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-[#D4AF37]" />
                  <div>
                    <p className="font-bold text-white">Uppal Dispatch Counter Mac</p>
                    <p className="text-[10px] text-slate-400">Counter Web Alert</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 font-bold rounded-full text-[10px] border border-emerald-500/30">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
