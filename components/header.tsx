'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { 
  ShoppingBag, Menu, X, User as UserIcon, LogOut, 
  LayoutDashboard, Package, ChevronDown, ShieldCheck, Star, 
  Sparkles, MessageCircle, ArrowUpRight, LogIn, Crown
} from 'lucide-react';
import VinayakaLogo from '@/components/vinayaka-logo';
import { useFestivalTheme } from '@/components/theme-provider';

const SUPER_ADMIN_EMAILS = ['pa0174492@gmail.com', 'sahuravindra897@gmail.com'];

export default function Header() {
  const { activeTheme } = useFestivalTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'super-admin' | 'admin' | 'user' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toggleCart, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  useEffect(() => {
    setMounted(true);
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        const email = currentUser.email.toLowerCase().trim();
        if (SUPER_ADMIN_EMAILS.includes(email)) {
          setUserRole('super-admin');
        } else {
          try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.success && data.users) {
              const u = data.users.find((x: any) => x.email?.toLowerCase() === email);
              if (u) {
                setUserRole(u.role);
              } else {
                setUserRole('user');
              }
            } else {
              setUserRole('user');
            }
          } catch {
            setUserRole('user');
          }
        }
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    if (auth) await signOut(auth);
    setUserDropdownOpen(false);
    setUser(null);
    setUserRole(null);
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Account';
  const initials = displayName.slice(0, 2).toUpperCase();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Raw Cashews', href: '/category/raw' },
    { name: 'Flavoured', href: '/category/flavored' },
    { name: 'Catalog', href: '/#shop' },
    { name: 'Our Story', href: '/#story' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all">
      {/* Top Announcement Bar */}
      <div 
        className="border-b py-1.5 px-4 text-center transition-colors duration-300"
        style={{
          backgroundColor: activeTheme?.primaryColor ? `${activeTheme.primaryColor}15` : '#0A111E',
          borderColor: activeTheme?.borderColor || 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px]">
          <div className="hidden sm:flex items-center space-x-2" style={{ color: activeTheme?.primaryColor || '#D4AF37' }}>
            <span className="text-xs">{activeTheme?.icon || '🪔'}</span>
            <span className="font-semibold">{activeTheme?.godName ? `${activeTheme.godName} • SVT` : 'Direct Uppal Roastery Counter'}</span>
          </div>

          <p className="mx-auto sm:mx-0 font-medium truncate max-w-xl text-slate-200">
            {activeTheme?.announcementTicker || '100% Pure W180 Jumbo & Gourmet Spiced Cashews • Wholesale & Retail'}
          </p>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/admin/products" className="text-slate-400 hover:text-[#D4AF37] transition-colors">
              Admin Suite
            </Link>
            <a
              href="https://wa.me/919515273464"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 font-semibold"
              style={{ color: activeTheme?.primaryColor || '#D4AF37' }}
            >
              <span>WhatsApp Desk</span>
              <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
            </a>
          </div>
        </div>
      </div>

      {/* Main Frosted Glass Navigation Bar */}
      <div className="bg-navy-950/90 backdrop-blur-md border-b border-white/10 shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Left: Brand Identity Lockup */}
            <Link href="/" className="flex items-center space-x-3.5 group shrink-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-navy-900 border border-[#D4AF37]/30 flex items-center justify-center p-1.5 transition-transform duration-300 group-hover:scale-105 shadow-sm">
                <VinayakaLogo showText={false} iconSize={26} />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-base sm:text-lg tracking-tight text-white group-hover:text-[#D4AF37] transition-colors leading-none flex items-center gap-1.5">
                  <span>SVT</span>
                  <span className="text-[#D4AF37] font-semibold text-xs uppercase tracking-widest hidden sm:inline">Cashews</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-1">
                  Sidhi Vinayaka Traders • Uppal
                </span>
              </div>
            </Link>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 bg-navy-900/60 p-1.5 rounded-2xl border border-white/5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-[#D4AF37] text-navy-950 shadow-sm font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions (Wholesale, Cart, Sign In / Account) */}
            <div className="flex items-center space-x-3">
              
              {/* WhatsApp Quick Order button */}
              <a
                href="https://wa.me/919515273464"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-colors"
                title="Direct Order via WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Quick Order</span>
              </a>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => toggleCart(true)}
                className="relative p-2.5 text-slate-200 hover:text-[#D4AF37] transition-colors bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 flex items-center space-x-1.5"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" strokeWidth={1.75} />
                <span className="hidden sm:inline text-xs font-bold text-slate-200">Cart</span>
                {mounted && totalItems > 0 && (
                  <span className="bg-[#D4AF37] text-navy-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-md">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* User Account Dropdown OR Prominent Sign In Button */}
              {mounted && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-[#D4AF37]/30 rounded-xl px-3 py-1.5 transition-all shadow-sm"
                    aria-label="User Menu"
                  >
                    {user.photoURL ? (
                      <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#D4AF37]/50">
                        <Image src={user.photoURL} alt={displayName} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-[#D4AF37] text-navy-950 font-bold text-xs flex items-center justify-center">
                        {initials}
                      </div>
                    )}
                    <span className="hidden sm:inline text-xs font-bold text-slate-200 max-w-[85px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} strokeWidth={1.75} />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-navy-900 border border-[#D4AF37]/30 rounded-2xl shadow-elevated overflow-hidden z-50 animate-in fade-in-50 zoom-in-95">
                      <div className="px-4 py-3 border-b border-white/10 bg-navy-950/80">
                        <p className="text-xs font-bold text-white truncate">{displayName}</p>
                        <p className="text-[10px] text-slate-400 truncate font-mono">{user.email}</p>
                        {userRole === 'super-admin' && (
                          <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-black rounded-full border border-[#D4AF37]/40 shadow-sm">
                            <Crown className="w-3 h-3 text-[#D4AF37]" />
                            <span>Super Admin</span>
                          </div>
                        )}
                        {userRole === 'admin' && (
                          <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-black rounded-full border border-blue-500/40 shadow-sm">
                            <ShieldCheck className="w-3 h-3 text-blue-400" />
                            <span>Store Admin</span>
                          </div>
                        )}
                        {userRole === 'user' && (
                          <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/40">
                            <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                            <span>SVT Member</span>
                          </div>
                        )}
                      </div>

                      <div className="py-2 text-xs">
                        {userRole === 'super-admin' || userRole === 'admin' ? (
                          <>
                            <Link
                              href="/admin/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2.5 font-bold text-[#D4AF37] hover:bg-white/5 transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
                              <span>Admin Dashboard</span>
                            </Link>
                            <Link
                              href="/admin/products"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2.5 font-bold text-[#D4AF37] hover:bg-white/5 transition-colors"
                            >
                              <Package className="w-4 h-4" strokeWidth={1.75} />
                              <span>Product Catalog Suite</span>
                            </Link>
                            <Link
                              href="/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2.5 font-semibold text-slate-300 hover:bg-white/5 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                              <span>Customer Dashboard</span>
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              href="/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2.5 font-semibold text-slate-200 hover:bg-white/5 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.75} />
                              <span>My Shopper Dashboard</span>
                            </Link>
                            <Link
                              href="/dashboard?tab=orders"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2.5 font-semibold text-slate-300 hover:bg-white/5 transition-colors"
                            >
                              <Package className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.75} />
                              <span>My Orders & Tracking</span>
                            </Link>
                          </>
                        )}

                        <div className="border-t border-white/10 mt-1 pt-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center space-x-3 px-4 py-2.5 font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" strokeWidth={1.75} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* PROMINENT SIGN IN BUTTON (Always visible on all screens) */
                <Link
                  href="/login"
                  className="flex items-center space-x-1.5 text-xs font-black text-navy-950 gold-cta-button px-4 py-2.5 rounded-xl shadow-lg transition-all hover:scale-102"
                >
                  <LogIn className="w-4 h-4 text-navy-950" strokeWidth={2.5} />
                  <span>SIGN IN</span>
                </Link>
              )}

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-300 hover:text-[#D4AF37] transition-colors rounded-xl hover:bg-white/5"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" strokeWidth={1.75} /> : <Menu className="w-6 h-6" strokeWidth={1.75} />}
              </button>

            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-navy-950 border-t border-white/10 px-6 pt-4 pb-6 space-y-3 text-sm font-semibold text-slate-200 shadow-2xl">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 transition-colors ${
                  pathname === link.href ? 'text-[#D4AF37] font-bold' : 'hover:text-[#D4AF37]'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-3 border-t border-white/10 space-y-2">
              <Link
                href="/admin/products"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 py-2 text-[#D4AF37] font-bold"
              >
                <Package className="w-4 h-4" />
                <span>Admin Product Catalog</span>
              </Link>

              <a
                href="https://wa.me/919515273464"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 py-1.5 text-emerald-400"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
                <span>WhatsApp Wholesale Desk</span>
              </a>

              {user ? (
                <>
                  <div className="text-[11px] text-slate-400 pb-1 font-mono">{user.email}</div>
                  {userRole === 'super-admin' || userRole === 'admin' ? (
                    <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 py-1.5 text-[#D4AF37] font-bold">
                      <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
                      <span>Admin Dashboard ({userRole === 'super-admin' ? 'Super Admin' : 'Admin'})</span>
                    </Link>
                  ) : (
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 py-1.5 text-[#D4AF37]">
                      <LayoutDashboard className="w-4 h-4" strokeWidth={1.75} />
                      <span>My Shopper Dashboard</span>
                    </Link>
                  )}
                  <button
                    onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                    className="flex items-center space-x-2 py-1.5 text-rose-400"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={1.75} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-center rounded-xl gold-cta-button text-navy-950 font-black text-xs uppercase"
                >
                  SIGN IN / REGISTER
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
