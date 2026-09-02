'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle, AlertTriangle, Send } from 'lucide-react';
import { getFirebaseMessaging } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';

export default function PushNotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermissionAndRegister = async () => {
    setLoading(true);
    setStatusMessage(null);

    try {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        setStatusMessage('Notifications not supported in this browser.');
        setLoading(false);
        return;
      }

      const res = await Notification.requestPermission();
      setPermission(res);

      if (res === 'granted') {
        const messaging = await getFirebaseMessaging();
        if (messaging) {
          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
          const currentToken = await getToken(messaging, { vapidKey });

          if (currentToken) {
            setToken(currentToken);
            // Save token to server DB endpoint
            await fetch('/api/admin/fcm-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: currentToken, device: navigator.userAgent }),
            });
            setStatusMessage('FCM Push Notifications enabled successfully!');
          } else {
            setStatusMessage('Could not retrieve FCM token. Check Firebase VAPID Key config.');
          }
        } else {
          setStatusMessage('Firebase Messaging is not configured on this domain.');
        }
      } else {
        setStatusMessage('Notification permission was denied by browser settings.');
      }
    } catch (err: any) {
      console.error('Error requesting FCM permission:', err);
      setStatusMessage(`Notification setup error: ${err.message || 'Unknown failure'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-700 shrink-0">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Admin Instant Order Push Alerts</h3>
          <p className="text-xs text-slate-500 mt-1">
            Receive real-time sound and banner notifications on your mobile or desktop whenever a new order is placed in Hyderabad.
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="text-slate-500">Status:</span>
          {permission === 'granted' ? (
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Notifications Active</span>
            </span>
          ) : permission === 'denied' ? (
            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full flex items-center space-x-1">
              <BellOff className="w-3.5 h-3.5" />
              <span>Permission Denied</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Not Configured</span>
            </span>
          )}
        </div>

        <button
          onClick={requestPermissionAndRegister}
          disabled={loading}
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
        >
          <Send className="w-3.5 h-3.5 text-amber-400" />
          <span>{loading ? 'Registering...' : 'Enable Instant Order Push Alerts'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-slate-50 text-xs font-medium text-slate-700 border border-slate-200">
          {statusMessage}
        </div>
      )}

      {token && (
        <div className="text-[10px] text-slate-400 font-mono break-all bg-slate-100 p-2 rounded-lg">
          Active FCM Token: {token}
        </div>
      )}
    </div>
  );
}
