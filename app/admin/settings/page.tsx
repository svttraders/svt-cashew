'use client';

import React from 'react';
import Link from 'next/link';
import PushNotificationManager from '@/components/push-notification-manager';
import { ArrowLeft, Bell, Smartphone, ShieldCheck } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="bg-[#FAF6EE] min-h-screen p-6 sm:p-10 space-y-6">
      <div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center space-x-2 text-xs font-bold text-[#193324] hover:underline mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order Dashboard</span>
        </Link>
        <h1 className="text-3xl font-black font-display text-[#193324]">
          Notification Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure real-time browser & mobile push alerts for Sidhi Vinayak Traders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <PushNotificationManager />
        </div>

        {/* Device Registration & Settings matching Screenshot 2 */}
        <div className="lg:col-span-5 bg-[#FFFDF9] rounded-2xl p-6 border border-[#E2DACB] space-y-4">
          <h3 className="text-base font-bold font-display text-[#193324]">
            Registered Admin Devices
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#F5F0E6] rounded-xl border border-[#E2DACB] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-[#193324]" />
                <div>
                  <p className="font-bold text-[#193324]">Ravindra's iPhone (Primary)</p>
                  <p className="text-[10px] text-slate-500">Registered • Active Push Token</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-[#D1E7DD] text-[#0F5132] font-bold rounded-full text-[10px]">Active</span>
            </div>

            <div className="p-3 bg-[#F5F0E6] rounded-xl border border-[#E2DACB] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-[#193324]" />
                <div>
                  <p className="font-bold text-[#193324]">Desktop Web Manager</p>
                  <p className="text-[10px] text-slate-500">Uppal Admin Counter</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-[#D1E7DD] text-[#0F5132] font-bold rounded-full text-[10px]">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
