'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell, CheckCircle2, Clock, Truck, ShoppingBag, CreditCard,
  Sparkles, X, Check, ArrowRight, Volume2, VolumeX, AlertCircle
} from 'lucide-react';

export interface INotificationItem {
  _id: string;
  recipientType: 'ADMIN' | 'USER' | 'ALL';
  recipientEmail?: string;
  orderId?: string;
  type: 'ORDER_PLACED' | 'ORDER_STATUS' | 'PAYMENT' | 'DELIVERY' | 'GENERAL';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationCenterProps {
  role?: 'ADMIN' | 'USER';
  userEmail?: string;
  userId?: string;
  variant?: 'navbar' | 'dashboard';
}

export default function NotificationCenter({
  role = 'USER',
  userEmail,
  userId,
  variant = 'navbar',
}: NotificationCenterProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const previousCountRef = useRef<number>(0);

  // Play subtle chime using Web Audio API
  const playChime = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio context might be restricted before first user interaction
    }
  };

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams();
      params.set('role', role);
      if (userEmail) params.set('email', userEmail);
      if (userId) params.set('userId', userId);

      const res = await fetch(`/api/notifications?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        const fetched: INotificationItem[] = data.notifications || [];
        const count: number = data.unreadCount || 0;

        // Trigger chime if new unread notification arrived
        if (count > previousCountRef.current && previousCountRef.current > 0) {
          playChime();
        }
        previousCountRef.current = count;

        setNotifications(fetched);
        setUnreadCount(count);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15s live poll
    return () => clearInterval(interval);
  }, [role, userEmail, userId]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notifId: string, link?: string) => {
    try {
      setNotifications(prev =>
        prev.map(n => (n._id === notifId ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: notifId }),
      });

      if (link) {
        setIsOpen(false);
        router.push(link);
      }
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);

      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markAllRead: true,
          email: userEmail,
          role,
        }),
      });
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER_PLACED':
        return <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />;
      case 'DELIVERY':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'ORDER_STATUS':
        return <Truck className="w-4 h-4 text-blue-400" />;
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-purple-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#D4AF37]" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className={`relative p-2.5 rounded-2xl transition-all ${
          isOpen
            ? 'bg-[#D4AF37] text-[#070D18] shadow-[0_0_15px_rgba(212,175,55,0.4)] font-black'
            : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-[#D4AF37] border border-white/10'
        }`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white font-black text-[10px] rounded-full flex items-center justify-center px-1 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0B1323] border border-[#D4AF37]/30 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#121E36] to-[#0A111E] p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="text-sm font-black text-white font-display">
                {role === 'ADMIN' ? 'Admin Alerts' : 'Notifications'}
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute Alert Sound' : 'Enable Alert Sound'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-xs transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-xs transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Pills & Actions */}
          <div className="px-4 py-2 bg-[#070D18] border-b border-white/5 flex items-center justify-between text-xs">
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-[#D4AF37] text-[#070D18]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('unread')}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  activeTab === 'unread'
                    ? 'bg-[#D4AF37] text-[#070D18]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[10px] text-[#D4AF37] hover:underline font-bold flex items-center space-x-1"
              >
                <Check className="w-3 h-3" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center space-y-2">
                <Bell className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-bold">No notifications to display</p>
                <p className="text-[10px] text-slate-500">
                  {activeTab === 'unread' ? 'You are all caught up!' : 'Order and delivery updates will appear here.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleMarkAsRead(n._id, n.link)}
                  className={`p-4 transition-colors cursor-pointer flex items-start space-x-3.5 text-left ${
                    !n.read ? 'bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10' : 'hover:bg-white/5 opacity-80'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-[#070D18] border border-white/10 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`text-xs font-black truncate ${!n.read ? 'text-[#D4AF37]' : 'text-white'}`}>
                        {n.title}
                      </h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 font-mono">
                      <span>
                        {new Date(n.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {n.link && (
                        <span className="text-[#D4AF37] font-bold flex items-center space-x-0.5">
                          <span>View Details</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Link */}
          {role === 'USER' && (
            <div className="p-3 bg-[#070D18] border-t border-white/10 text-center">
              <Link
                href="/dashboard?tab=track"
                onClick={() => setIsOpen(false)}
                className="text-xs font-black text-[#D4AF37] hover:underline uppercase tracking-wider flex items-center justify-center space-x-1"
              >
                <span>Open Live Consignment Tracker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
