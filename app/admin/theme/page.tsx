'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminGuard from '@/components/admin-guard';
import {
  Palette, Sparkles, Check, Crown, Eye, Zap, RefreshCw,
  Monitor, Tablet, Smartphone, Sliders, ArrowRight, Save,
  Trash2, Plus, AlertTriangle, CheckCircle2, ChevronLeft, ShieldCheck, Flame,
  Sun, Moon, Volume2, Music, ExternalLink, Image as ImageIcon, Heart, Info
} from 'lucide-react';
import VinayakaLogo from '@/components/vinayaka-logo';
import { PRESET_FESTIVAL_THEMES, FestivalThemePreset } from '@/lib/festival-themes';
import { useFestivalTheme } from '@/components/theme-provider';

// Curated Online Royalty-Free Festive Deities & Sacred Motifs
const GOD_IMAGE_LIBRARY = [
  {
    name: 'Lord Ganesha (Vighnaharta)',
    festival: 'Ganesh Chaturthi',
    url: 'https://images.unsplash.com/photo-1567591974584-f1832dfcad52?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1567591974584-f1832dfcad52?w=1200&auto=format&fit=crop&q=80',
    quote: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
    badge: 'Vinayaka Chavithi Blessings',
  },
  {
    name: 'Goddess Lakshmi & Diyas',
    festival: 'Diwali',
    url: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1514195037031-83d60ed3b448?w=1200&auto=format&fit=crop&q=80',
    quote: 'शुभ दीपावली • May Goddess Lakshmi illuminate your life with health, happiness, and prosperity.',
    badge: 'Diwali Grand Festivity',
  },
  {
    name: 'Radha Krishna & Gulal Rang',
    festival: 'Holi',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80',
    quote: 'होली के पावन पर्व पर आपके जीवन में आनंद और उमंग के अनगिनत रंग बरसें!',
    badge: 'Rangotsav Special',
  },
  {
    name: 'Goddess Durga (Shakti)',
    festival: 'Navratri',
    url: 'https://images.unsplash.com/photo-1570535359195-bf436c84cce3?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1570535359195-bf436c84cce3?w=1200&auto=format&fit=crop&q=80',
    quote: 'सर्वमंगल मांगल्ये शिवे सर्वार्थ साधिके। शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥',
    badge: 'Navratri Shakti Edition',
  },
  {
    name: 'Shri Krishna & Peacock Feather',
    festival: 'Janmashtami',
    url: 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?w=1200&auto=format&fit=crop&q=80',
    quote: 'वसुदेवसुतं देवं कंसचाणूरमर्दनम्। देवकीपरमानन्दं कृष्णं वन्दे जगद्गुरुम्॥',
    badge: 'Janmashtami Divine',
  },
  {
    name: 'Surya Bhagwan & Pongal Harvest',
    festival: 'Pongal / Sankranti',
    url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&auto=format&fit=crop&q=80',
    quote: 'मकर संक्रान्ति व पोंगल के पावन अवसर पर आपके घर में सुख, समृद्धि और मिठास की वर्षा हो!',
    badge: 'Harvest Festivity',
  },
  {
    name: 'Crescent Moon & Holy Sanctuary',
    festival: 'Eid Mubarak',
    url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&auto=format&fit=crop&q=80',
    quote: 'تَقَبَّلَ اللّهُ مِنَّا وَ مِنْكُم • May Allah shower his countless blessings on you and your family.',
    badge: 'Eid Festive Collection',
  },
  {
    name: 'Holiday Pine & Starlight',
    festival: 'Christmas & New Year',
    url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1200&auto=format&fit=crop&q=80',
    quote: 'May your holiday season sparkle with moments of love, laughter, and goodwill.',
    badge: 'Holiday Season Joy',
  },
];

export default function FestivalThemeStudioPage() {
  const { refreshTheme, setLocalTheme, playFestiveChime } = useFestivalTheme();

  const [activeThemeId, setActiveThemeId] = useState<string>('royal-gold');
  const [activeTheme, setActiveTheme] = useState<FestivalThemePreset>(PRESET_FESTIVAL_THEMES[12] || PRESET_FESTIVAL_THEMES[0]);
  const [customThemes, setCustomThemes] = useState<FestivalThemePreset[]>([]);
  const [selectedPreviewTheme, setSelectedPreviewTheme] = useState<FestivalThemePreset>(PRESET_FESTIVAL_THEMES[0]);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Filtering & Category state
  const [filterMode, setFilterMode] = useState<'ALL' | 'LIGHT' | 'DARK'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Custom Creator Form State
  const [customForm, setCustomForm] = useState<Partial<FestivalThemePreset>>({
    name: '',
    festival: 'Custom Indian Celebration',
    icon: '🪔',
    mode: 'LIGHT',
    primaryColor: '#B45309',
    secondaryColor: '#D97706',
    accentColor: '#EA580C',
    backgroundColor: '#FFFDF7',
    cardBg: '#FFFFFF',
    textColor: '#1E1B18',
    textMuted: '#6B7280',
    glowColor: 'rgba(217, 119, 6, 0.35)',
    borderColor: 'rgba(217, 119, 6, 0.25)',
    announcementTicker: '🪔 Special Festive Gifting Counter Open • 100% Pure W180 Jumbo Cashews',
    heroHeadline: 'Divine Handcrafted Cashew Treats for Celebrations',
    heroSubtitle: 'Freshly sorted and roasted at our facility in Uppal, Hyderabad.',
    heroBadge: 'Special Festival Edition',
    godImageUrl: 'https://images.unsplash.com/photo-1567591974584-f1832dfcad52?w=600&auto=format&fit=crop&q=80',
    godName: 'Sidhi Vinayaka Heritage',
    festivalBannerUrl: 'https://images.unsplash.com/photo-1514195037031-83d60ed3b448?w=1200&auto=format&fit=crop&q=80',
    blessingQuote: 'May this festival bring abundance and joy to your family.',
    bgPattern: 'rangoli',
    ambientEffect: 'diya-sparks',
  });

  const [syncHomepageCopy, setSyncHomepageCopy] = useState(true);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [activeTabSection, setActiveTabSection] = useState<'presets' | 'create' | 'custom' | 'god-gallery'>('presets');

  const fetchThemeData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/theme');
      const data = await res.json();
      if (data.success) {
        setActiveThemeId(data.activeThemeId || 'royal-gold');
        if (data.activeTheme) {
          setActiveTheme(data.activeTheme);
          setSelectedPreviewTheme(data.activeTheme);
        }
        if (data.customThemes) setCustomThemes(data.customThemes);
      }
    } catch (err) {
      console.warn('Error fetching themes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemeData();
  }, []);

  const handleActivateTheme = async (theme: FestivalThemePreset) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SET_ACTIVE_THEME',
          themeId: theme.id,
          syncHomepageCopy: syncHomepageCopy,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveThemeId(theme.id);
        setActiveTheme(theme);
        setSelectedPreviewTheme(theme);
        setLocalTheme(theme);
        await refreshTheme();
        playFestiveChime();
        setStatusMsg(`🎉 Successfully deployed "${theme.name}" live across the entire store!`);
        setTimeout(() => setStatusMsg(''), 5000);
      }
    } catch (err) {
      console.error('Activate theme error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateCustomTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.name?.trim()) return;

    setActionLoading(true);
    try {
      const newTheme: FestivalThemePreset = {
        id: `custom-${Date.now()}`,
        name: customForm.name,
        festival: customForm.festival || 'Custom Indian Celebration',
        tagline: customForm.tagline || 'Custom curated festive color harmony',
        icon: customForm.icon || '🪔',
        category: 'FESTIVAL',
        mode: customForm.mode || 'LIGHT',
        primaryColor: customForm.primaryColor || '#B45309',
        secondaryColor: customForm.secondaryColor || '#D97706',
        accentColor: customForm.accentColor || '#EA580C',
        backgroundColor: customForm.backgroundColor || '#FFFDF7',
        cardBg: customForm.cardBg || '#FFFFFF',
        textColor: customForm.textColor || '#1E1B18',
        textMuted: customForm.textMuted || '#6B7280',
        glowColor: customForm.glowColor || 'rgba(217, 119, 6, 0.35)',
        borderColor: customForm.borderColor || 'rgba(217, 119, 6, 0.25)',
        announcementTicker: customForm.announcementTicker || 'Direct Uppal Roastery Counter • 100% Pure W180 Jumbo Cashews',
        heroHeadline: customForm.heroHeadline || 'Supreme Quality Handpicked Cashews',
        heroSubtitle: customForm.heroSubtitle || 'Directly sourced from trusted orchards and freshly sorted in Uppal.',
        heroBadge: customForm.heroBadge || 'Special Celebration Edition',
        godImageUrl: customForm.godImageUrl || 'https://images.unsplash.com/photo-1567591974584-f1832dfcad52?w=600&auto=format&fit=crop&q=80',
        godName: customForm.godName || 'Sidhi Vinayaka Blessings',
        festivalBannerUrl: customForm.festivalBannerUrl || 'https://images.unsplash.com/photo-1514195037031-83d60ed3b448?w=1200&auto=format&fit=crop&q=80',
        blessingQuote: customForm.blessingQuote || 'May this festival bring abundance and joy to your family.',
        bgPattern: customForm.bgPattern || 'rangoli',
        ambientEffect: customForm.ambientEffect || 'diya-sparks',
        paletteClusters: [
          customForm.primaryColor || '#B45309',
          customForm.secondaryColor || '#D97706',
          customForm.accentColor || '#EA580C',
          customForm.backgroundColor || '#FFFDF7'
        ],
      };

      const res = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_CUSTOM_THEME',
          customTheme: newTheme,
          activateImmediately: true,
          syncHomepageCopy: syncHomepageCopy,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomThemes(prev => [...prev, newTheme]);
        setActiveThemeId(newTheme.id);
        setActiveTheme(newTheme);
        setSelectedPreviewTheme(newTheme);
        setLocalTheme(newTheme);
        await refreshTheme();
        playFestiveChime();
        setActiveTabSection('presets');
        setStatusMsg(`🎉 Custom theme "${newTheme.name}" created and deployed live!`);
        setTimeout(() => setStatusMsg(''), 5000);
      }
    } catch (err) {
      console.error('Create theme error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCustomTheme = async (themeId: string, name: string) => {
    if (!window.confirm(`Delete custom theme "${name}"?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/theme?id=${themeId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCustomThemes(prev => prev.filter(t => t.id !== themeId));
        if (activeThemeId === themeId) {
          const fallback = PRESET_FESTIVAL_THEMES[0];
          handleActivateTheme(fallback);
        }
        setStatusMsg(`Custom theme deleted.`);
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const applyGodPreset = (preset: typeof GOD_IMAGE_LIBRARY[0]) => {
    setCustomForm(prev => ({
      ...prev,
      godImageUrl: preset.url,
      godName: preset.name,
      festivalBannerUrl: preset.banner,
      blessingQuote: preset.quote,
      heroBadge: preset.badge,
    }));
    setStatusMsg(`Applied imagery for "${preset.name}"!`);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const filteredPresets = useMemo(() => {
    return PRESET_FESTIVAL_THEMES.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.festival.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMode = filterMode === 'ALL' || p.mode === filterMode;
      return matchesSearch && matchesMode;
    });
  }, [searchQuery, filterMode]);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#070D18] text-slate-100 selection:bg-[#D4AF37] selection:text-[#070D18]">

        {/* Top Sticky Header with Constant Brand Identity */}
        <header className="sticky top-0 z-40 bg-[#0A111E]/95 backdrop-blur-xl border-b border-[#D4AF37]/20 px-4 sm:px-8 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-[#D4AF37] border border-white/10 transition-colors"
              title="Back to Admin Dashboard"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>

            {/* Constant SVT Brand Logo */}
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-black border border-[#D4AF37]/40 flex items-center justify-center p-1 shadow-md">
                <VinayakaLogo showText={false} iconSize={22} />
              </div>
              <div className="hidden sm:block">
                <span className="font-heading font-black text-sm tracking-tight text-white flex items-center gap-1">
                  <span>SVT</span>
                  <span className="text-[#D4AF37] font-semibold text-[10px] tracking-widest uppercase">Cashews</span>
                </span>
                <span className="text-[9px] text-slate-400 font-medium block">Sidhi Vinayaka Traders</span>
              </div>
            </Link>

            <div className="border-l border-white/10 pl-3">
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
                <span>🪔</span> Indian Festival UI & Theme Studio
                <span className="text-[9px] bg-gradient-to-r from-amber-400 to-amber-600 text-black px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  Super Admin Pro
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                Deploy light & dark festival color clusters, deity imagery & ambient particle animations live.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={playFestiveChime}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
              title="Play Divine Temple Chime"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Divine Chime</span>
            </button>

            <button
              onClick={() => handleActivateTheme(selectedPreviewTheme)}
              disabled={actionLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B48328] hover:from-[#E5BF45] hover:to-[#C69435] text-[#070D18] font-black text-xs uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20 transition-all disabled:opacity-50"
            >
              {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              <span>Deploy Active Theme Live</span>
            </button>
          </div>
        </header>

        {/* Feedback Alert */}
        {statusMsg && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {statusMsg}
              </span>
              <button onClick={() => setStatusMsg('')} className="text-emerald-400 hover:text-white text-sm">✕</button>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-8">

          {/* Active Live Banner Card */}
          <div
            className="p-5 sm:p-6 rounded-3xl border transition-all duration-500 shadow-2xl relative overflow-hidden"
            style={{
              backgroundColor: activeTheme.cardBg,
              borderColor: activeTheme.borderColor,
              color: activeTheme.textColor,
            }}
          >
            {/* Background Image Ambient Glow */}
            <div
              className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none mix-blend-screen"
              style={{ backgroundImage: `url(${activeTheme.festivalBannerUrl})` }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

              <div className="flex items-start space-x-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl shrink-0 bg-black/40">
                  <Image
                    src={activeTheme.godImageUrl}
                    alt={activeTheme.godName}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <span className="absolute top-1 right-1 text-xs bg-black/60 rounded-full px-1 py-0.5">
                    {activeTheme.icon}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Storefront Theme
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 border border-white/15 flex items-center gap-1">
                      {activeTheme.mode === 'LIGHT' ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-indigo-400" />}
                      {activeTheme.mode} Festive Mode
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                    {activeTheme.name}
                  </h2>
                  <p className="text-xs opacity-80 line-clamp-1">
                    {activeTheme.tagline} • Divine Aura: <span className="font-bold">{activeTheme.godName}</span>
                  </p>
                  <p className="text-[11px] italic opacity-75 font-serif pt-1">
                    “{activeTheme.blessingQuote}”
                  </p>
                </div>
              </div>

              {/* 4-Color Swatch Cluster */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-black/30 p-3.5 rounded-2xl border border-white/10 backdrop-blur-md">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">Color Palette Cluster</p>
                  <div className="flex items-center space-x-2">
                    {[
                      { name: 'Primary', color: activeTheme.primaryColor },
                      { name: 'Secondary', color: activeTheme.secondaryColor },
                      { name: 'Accent', color: activeTheme.accentColor },
                      { name: 'Canvas', color: activeTheme.backgroundColor },
                    ].map((item, i) => (
                      <div key={i} className="text-center group relative">
                        <div
                          className="w-8 h-8 rounded-xl border border-white/30 shadow-md transition-transform group-hover:scale-110"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[9px] font-mono opacity-80 block mt-0.5">{item.color}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-right border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Ambient FX</p>
                  <span className="text-xs font-black uppercase text-amber-400">{activeTheme.ambientEffect}</span>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mt-1">Pattern</p>
                  <span className="text-xs font-black uppercase text-cyan-400">{activeTheme.bgPattern}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Studio Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D4AF37]/20 pb-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTabSection('presets')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTabSection === 'presets'
                    ? 'bg-[#D4AF37] text-[#070D18] shadow-lg font-black'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
              >
                🪔 Indian Festival Presets ({PRESET_FESTIVAL_THEMES.length})
              </button>

              <button
                onClick={() => setActiveTabSection('create')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTabSection === 'create'
                    ? 'bg-[#D4AF37] text-[#070D18] shadow-lg font-black'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Custom Color Cluster Studio</span>
              </button>

              <button
                onClick={() => setActiveTabSection('god-gallery')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTabSection === 'god-gallery'
                    ? 'bg-[#D4AF37] text-[#070D18] shadow-lg font-black'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Deity & Festive Imagery Library</span>
              </button>

              {customThemes.length > 0 && (
                <button
                  onClick={() => setActiveTabSection('custom')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTabSection === 'custom'
                      ? 'bg-[#D4AF37] text-[#070D18] shadow-lg font-black'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  ✨ My Saved Custom Themes ({customThemes.length})
                </button>
              )}
            </div>

            {/* Sync Homepage Copy Switch */}
            <label className="flex items-center space-x-2 text-xs text-slate-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncHomepageCopy}
                onChange={(e) => setSyncHomepageCopy(e.target.checked)}
                className="w-4 h-4 rounded text-[#D4AF37] bg-[#070D18] border-white/20 focus:ring-0"
              />
              <span className="font-semibold">Sync Homepage Announcement & Headlines</span>
            </label>
          </div>

          {/* SECTION 1: PRESETS CATALOG */}
          {activeTabSection === 'presets' && (
            <div className="space-y-6">

              {/* Filter and Mode Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0A111E] p-4 rounded-2xl border border-white/10">

                {/* Light vs Dark Mode Filter */}
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">Mode:</span>
                  <button
                    onClick={() => setFilterMode('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filterMode === 'ALL'
                        ? 'bg-white/20 text-white font-black'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                  >
                    All Modes ({PRESET_FESTIVAL_THEMES.length})
                  </button>
                  <button
                    onClick={() => setFilterMode('LIGHT')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${filterMode === 'LIGHT'
                        ? 'bg-amber-400 text-black font-black shadow-md'
                        : 'bg-white/5 text-amber-300 hover:bg-white/10'
                      }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>☀️ Light Festive</span>
                  </button>
                  <button
                    onClick={() => setFilterMode('DARK')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${filterMode === 'DARK'
                        ? 'bg-indigo-600 text-white font-black shadow-md'
                        : 'bg-white/5 text-indigo-300 hover:bg-white/10'
                      }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>🌙 Midnight Festive</span>
                  </button>
                </div>

                {/* Search */}
                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search festival (Diwali, Holi, Pongal, Ganesh)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#070D18] border border-white/15 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPresets.map((preset) => {
                  const isActive = activeThemeId === preset.id;
                  const isSelected = selectedPreviewTheme.id === preset.id;

                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPreviewTheme(preset)}
                      className={`group relative rounded-3xl p-5 border cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl ${isSelected
                          ? 'ring-2 ring-[#D4AF37] border-transparent scale-[1.01]'
                          : 'border-white/10 hover:border-white/30 bg-[#0A111E]'
                        }`}
                      style={{
                        backgroundColor: preset.mode === 'LIGHT' ? '#111827' : '#0A111E',
                      }}
                    >
                      {/* Top Header */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-2xl p-1.5 bg-white/5 rounded-xl border border-white/10">{preset.icon}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1 ${preset.mode === 'LIGHT' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                  }`}>
                                  {preset.mode === 'LIGHT' ? <Sun className="w-2.5 h-2.5" /> : <Moon className="w-2.5 h-2.5" />}
                                  {preset.mode}
                                </span>
                                <span className="text-[9px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase">
                                  {preset.festival.split('/')[0]}
                                </span>
                              </div>
                              <h3 className="font-black text-sm text-white mt-1 group-hover:text-[#D4AF37] transition-colors">
                                {preset.name}
                              </h3>
                            </div>
                          </div>

                          {isActive && (
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <Check className="w-3 h-3" /> Live
                            </span>
                          )}
                        </div>

                        {/* Deity Avatar Preview & Quote */}
                        <div className="flex items-center space-x-3 bg-black/40 p-2.5 rounded-2xl border border-white/5">
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-white/15 shrink-0 bg-black/20">
                            <Image
                              src={preset.godImageUrl}
                              alt={preset.godName}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-[11px] font-bold text-slate-200 truncate">{preset.godName}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1 italic">{preset.blessingQuote}</p>
                          </div>
                        </div>

                        {/* Palette Swatches */}
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Color Palette Swatches</p>
                          <div className="flex items-center space-x-2">
                            {[
                              { label: 'Primary', color: preset.primaryColor },
                              { label: 'Secondary', color: preset.secondaryColor },
                              { label: 'Accent', color: preset.accentColor },
                              { label: 'Canvas', color: preset.backgroundColor },
                            ].map((c, idx) => (
                              <div key={idx} className="flex-1">
                                <div
                                  className="h-6 rounded-lg border border-white/20 shadow-sm"
                                  style={{ backgroundColor: c.color }}
                                />
                                <span className="text-[8px] font-mono text-slate-400 block text-center mt-0.5">{c.color}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Bottom Action Bar */}
                      <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPreviewTheme(preset);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivateTheme(preset);
                          }}
                          disabled={isActive || actionLoading}
                          className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                              : 'bg-gradient-to-r from-[#D4AF37] to-[#B48328] hover:from-[#E5BF45] hover:to-[#C69435] text-[#070D18] shadow-md'
                            }`}
                        >
                          {isActive ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5" />
                              <span>Deploy Live</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* SECTION 2: CUSTOM COLOR CLUSTER STUDIO */}
          {activeTabSection === 'create' && (
            <div className="bg-[#0A111E] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-8">

              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#D4AF37]" />
                  Custom Indian Festival & Color Cluster Engine
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Craft completely customized light or midnight festive themes with live CSS variable injection, divine deity imagery, and ambient particle clouds.
                </p>
              </div>

              <form onSubmit={handleCreateCustomTheme} className="space-y-6">

                {/* 1. Basic Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Theme Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ayodhya Ram Mandir Mahotsav"
                      value={customForm.name || ''}
                      onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                      className="w-full bg-[#070D18] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Festival Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Diwali, Ram Navami, Ugadi"
                      value={customForm.festival || ''}
                      onChange={(e) => setCustomForm({ ...customForm, festival: e.target.value })}
                      className="w-full bg-[#070D18] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Theme Mode</label>
                    <select
                      value={customForm.mode || 'LIGHT'}
                      onChange={(e) => setCustomForm({ ...customForm, mode: e.target.value as 'LIGHT' | 'DARK' })}
                      className="w-full bg-[#070D18] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="LIGHT">☀️ Light Festive (Ivory / Spring / Harvest)</option>
                      <option value="DARK">🌙 Midnight Festive (Diya Embers / Royal Silk)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Festival Icon Emoji</label>
                    <input
                      type="text"
                      value={customForm.icon || '🪔'}
                      onChange={(e) => setCustomForm({ ...customForm, icon: e.target.value })}
                      className="w-full bg-[#070D18] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                {/* 2. Color Cluster Swatches */}
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                        <Palette className="w-4 h-4" /> 4-Color Cluster Architecture
                      </h4>
                      <p className="text-[11px] text-slate-400">Harmonize the primary brand color, secondary festive hue, accent glow, and canvas background.</p>
                    </div>

                    {/* Fast Harmonizer Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCustomForm({
                            ...customForm,
                            mode: 'LIGHT',
                            primaryColor: '#B45309',
                            secondaryColor: '#D97706',
                            accentColor: '#EA580C',
                            backgroundColor: '#FFFDF7',
                            cardBg: '#FFFFFF',
                            textColor: '#1E1B18',
                            textMuted: '#6B7280',
                            glowColor: 'rgba(217, 119, 6, 0.35)',
                            borderColor: 'rgba(217, 119, 6, 0.25)',
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-400/10 text-amber-300 text-[10px] font-bold border border-amber-400/20"
                      >
                        ☀️ Warm Ivory
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomForm({
                            ...customForm,
                            mode: 'LIGHT',
                            primaryColor: '#E11D48',
                            secondaryColor: '#0D9488',
                            accentColor: '#F59E0B',
                            backgroundColor: '#FFF5F8',
                            cardBg: '#FFFFFF',
                            textColor: '#1F2937',
                            textMuted: '#6B7280',
                            glowColor: 'rgba(225, 29, 72, 0.35)',
                            borderColor: 'rgba(13, 148, 136, 0.3)',
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-pink-400/10 text-pink-300 text-[10px] font-bold border border-pink-400/20"
                      >
                        🌸 Spring Pastel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomForm({
                            ...customForm,
                            mode: 'DARK',
                            primaryColor: '#FFD700',
                            secondaryColor: '#FF5722',
                            accentColor: '#00F5D4',
                            backgroundColor: '#0A0612',
                            cardBg: '#150C24',
                            textColor: '#FFF9E6',
                            textMuted: '#D1C4E9',
                            glowColor: 'rgba(255, 215, 0, 0.45)',
                            borderColor: 'rgba(255, 215, 0, 0.35)',
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-400/10 text-indigo-300 text-[10px] font-bold border border-indigo-400/20"
                      >
                        🌙 Midnight Gold
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Primary Color</label>
                      <div className="flex items-center space-x-2 bg-[#070D18] p-1.5 rounded-xl border border-white/10">
                        <input
                          type="color"
                          value={customForm.primaryColor || '#B45309'}
                          onChange={(e) => setCustomForm({ ...customForm, primaryColor: e.target.value })}
                          className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={customForm.primaryColor || '#B45309'}
                          onChange={(e) => setCustomForm({ ...customForm, primaryColor: e.target.value })}
                          className="w-full bg-transparent text-[11px] font-mono text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Secondary Color</label>
                      <div className="flex items-center space-x-2 bg-[#070D18] p-1.5 rounded-xl border border-white/10">
                        <input
                          type="color"
                          value={customForm.secondaryColor || '#D97706'}
                          onChange={(e) => setCustomForm({ ...customForm, secondaryColor: e.target.value })}
                          className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={customForm.secondaryColor || '#D97706'}
                          onChange={(e) => setCustomForm({ ...customForm, secondaryColor: e.target.value })}
                          className="w-full bg-transparent text-[11px] font-mono text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Accent Color</label>
                      <div className="flex items-center space-x-2 bg-[#070D18] p-1.5 rounded-xl border border-white/10">
                        <input
                          type="color"
                          value={customForm.accentColor || '#EA580C'}
                          onChange={(e) => setCustomForm({ ...customForm, accentColor: e.target.value })}
                          className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={customForm.accentColor || '#EA580C'}
                          onChange={(e) => setCustomForm({ ...customForm, accentColor: e.target.value })}
                          className="w-full bg-transparent text-[11px] font-mono text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Background Canvas</label>
                      <div className="flex items-center space-x-2 bg-[#070D18] p-1.5 rounded-xl border border-white/10">
                        <input
                          type="color"
                          value={customForm.backgroundColor || '#FFFDF7'}
                          onChange={(e) => setCustomForm({ ...customForm, backgroundColor: e.target.value })}
                          className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={customForm.backgroundColor || '#FFFDF7'}
                          onChange={(e) => setCustomForm({ ...customForm, backgroundColor: e.target.value })}
                          className="w-full bg-transparent text-[11px] font-mono text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Card Background</label>
                      <div className="flex items-center space-x-2 bg-[#070D18] p-1.5 rounded-xl border border-white/10">
                        <input
                          type="color"
                          value={customForm.cardBg || '#FFFFFF'}
                          onChange={(e) => setCustomForm({ ...customForm, cardBg: e.target.value })}
                          className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={customForm.cardBg || '#FFFFFF'}
                          onChange={(e) => setCustomForm({ ...customForm, cardBg: e.target.value })}
                          className="w-full bg-transparent text-[11px] font-mono text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Text Color</label>
                      <div className="flex items-center space-x-2 bg-[#070D18] p-1.5 rounded-xl border border-white/10">
                        <input
                          type="color"
                          value={customForm.textColor || '#1E1B18'}
                          onChange={(e) => setCustomForm({ ...customForm, textColor: e.target.value })}
                          className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={customForm.textColor || '#1E1B18'}
                          onChange={(e) => setCustomForm({ ...customForm, textColor: e.target.value })}
                          className="w-full bg-transparent text-[11px] font-mono text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. God & Festival Imagery Configuration */}
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" /> Divine Deity Image & Background Artwork
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Divine Deity / Festival Avatar Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Lord Ganesha, Maha Lakshmi, Lord Krishna"
                        value={customForm.godName || ''}
                        onChange={(e) => setCustomForm({ ...customForm, godName: e.target.value })}
                        className="w-full bg-[#070D18] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">God Image URL (Free High-Res CDN)</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={customForm.godImageUrl || ''}
                        onChange={(e) => setCustomForm({ ...customForm, godImageUrl: e.target.value })}
                        className="w-full bg-[#070D18] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Festival Banner Backdrop URL</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={customForm.festivalBannerUrl || ''}
                        onChange={(e) => setCustomForm({ ...customForm, festivalBannerUrl: e.target.value })}
                        className="w-full bg-[#070D18] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Blessing Mantra / Quote</label>
                      <input
                        type="text"
                        placeholder="e.g. शुभ दीपावली • May Goddess Lakshmi shower abundance"
                        value={customForm.blessingQuote || ''}
                        onChange={(e) => setCustomForm({ ...customForm, blessingQuote: e.target.value })}
                        className="w-full bg-[#070D18] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Ambient Effect & Pattern */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Ambient Background Particles</label>
                    <select
                      value={customForm.ambientEffect || 'diya-sparks'}
                      onChange={(e) => setCustomForm({ ...customForm, ambientEffect: e.target.value as any })}
                      className="w-full bg-[#070D18] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="diya-sparks">🪔 Floating Diya Sparks & Embers (Diwali / Deepam)</option>
                      <option value="gulal-burst">🎨 Gulal Splash & Color Clouds (Holi)</option>
                      <option value="golden-petals">🌸 Sacred Marigold & Rose Petal Shower (Puja / Pongal)</option>
                      <option value="crescent-stars">🌙 Crescent Moon & Starry Constellation (Eid)</option>
                      <option value="peacock-aura">🦚 Peacock Feather & Flute Shimmer (Krishna)</option>
                      <option value="snow-stars">❄️ Winter Snow Stars (Christmas / New Year)</option>
                      <option value="roastery-gold">👑 Royal 24K Gold Particles (Signature SVT)</option>
                      <option value="none">None</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Subtle Background Pattern</label>
                    <select
                      value={customForm.bgPattern || 'rangoli'}
                      onChange={(e) => setCustomForm({ ...customForm, bgPattern: e.target.value as any })}
                      className="w-full bg-[#070D18] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="rangoli">Rangoli Symmetry Vector</option>
                      <option value="mandala">Sacred Mandala Grid</option>
                      <option value="crescent-stars">Crescent Starlight Mesh</option>
                      <option value="lotus-waves">Lotus Petal Waves</option>
                      <option value="gulal-splash">Gulal Powder Splash</option>
                      <option value="snow-flakes">Snowflake Crystals</option>
                      <option value="none">Clean Solid Background</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B48328] hover:from-[#E5BF45] hover:to-[#C69435] text-[#070D18] font-black text-xs uppercase tracking-wider shadow-xl shadow-[#D4AF37]/20 flex items-center gap-2"
                  >
                    {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save & Deploy Custom Theme Live</span>
                  </button>
                </div>

              </form>

            </div>
          )}

          {/* SECTION 3: GOD & FESTIVE IMAGERY LIBRARY */}
          {activeTabSection === 'god-gallery' && (
            <div className="space-y-6">
              <div className="bg-[#0A111E] p-6 rounded-3xl border border-white/10">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                  Royalty-Free Sacred Deity & Festive Artwork Gallery
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  1-Click select high-resolution online free imagery for different Indian festivities to use in custom themes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {GOD_IMAGE_LIBRARY.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[#0A111E] rounded-3xl border border-white/10 overflow-hidden shadow-xl flex flex-col justify-between group hover:border-[#D4AF37] transition-all"
                  >
                    <div>
                      <div className="relative h-44 w-full bg-black/40">
                        <Image
                          src={item.url}
                          alt={item.name}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-black/70 text-amber-300 backdrop-blur-md">
                          {item.festival}
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <h4 className="font-black text-sm text-white">{item.name}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 italic">{item.quote}</p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <button
                        onClick={() => {
                          applyGodPreset(item);
                          setActiveTabSection('create');
                        }}
                        className="w-full py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400 text-amber-300 hover:text-black font-black text-xs uppercase tracking-wider transition-all border border-amber-400/20"
                      >
                        Use In Custom Theme Studio
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: SAVED CUSTOM THEMES */}
          {activeTabSection === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customThemes.map((theme) => {
                const isActive = activeThemeId === theme.id;
                return (
                  <div
                    key={theme.id}
                    className="bg-[#0A111E] rounded-3xl border border-white/10 p-5 space-y-4 shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{theme.icon}</span>
                          <div>
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-amber-400/20 text-amber-300">
                              {theme.mode || 'LIGHT'} Mode
                            </span>
                            <h4 className="font-black text-sm text-white mt-0.5">{theme.name}</h4>
                          </div>
                        </div>
                        {isActive && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                            Live
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {[theme.primaryColor, theme.secondaryColor, theme.accentColor, theme.backgroundColor].map((color, i) => (
                          <div key={i} className="flex-1">
                            <div className="h-5 rounded-md border border-white/20" style={{ backgroundColor: color }} />
                            <span className="text-[8px] font-mono text-slate-400 block text-center mt-0.5">{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <button
                        onClick={() => handleDeleteCustomTheme(theme.id, theme.name)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Theme"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleActivateTheme(theme)}
                        disabled={isActive || actionLoading}
                        className="px-3.5 py-1.5 rounded-xl bg-[#D4AF37] text-black font-black text-xs uppercase tracking-wider hover:bg-[#E5BF45] disabled:opacity-50"
                      >
                        {isActive ? 'Active' : 'Deploy Live'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 360° LIVE DEVICE SIMULATOR WITH CONSTANT SVT LOGO */}
          <div className="bg-[#0A111E] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#D4AF37]" />
                  Live 360° Storefront Device Simulator
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time preview of how your active festival theme & colors render across visitor devices with constant brand logo.
                </p>
              </div>

              {/* Viewport Switcher */}
              <div className="flex items-center space-x-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewViewport('desktop')}
                  className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${previewViewport === 'desktop'
                      ? 'bg-[#D4AF37] text-[#070D18] shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desktop (1440px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('tablet')}
                  className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${previewViewport === 'tablet'
                      ? 'bg-[#D4AF37] text-[#070D18] shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tablet (768px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('mobile')}
                  className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${previewViewport === 'mobile'
                      ? 'bg-[#D4AF37] text-[#070D18] shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mobile (390px)</span>
                </button>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="flex justify-center bg-black/50 p-4 sm:p-8 rounded-2xl border border-white/5 overflow-x-auto">
              <div
                className={`transition-all duration-300 rounded-2xl overflow-hidden border shadow-2xl relative ${previewViewport === 'desktop'
                    ? 'w-full max-w-4xl'
                    : previewViewport === 'tablet'
                      ? 'w-[680px]'
                      : 'w-[360px]'
                  }`}
                style={{
                  backgroundColor: selectedPreviewTheme.backgroundColor,
                  borderColor: selectedPreviewTheme.borderColor,
                  color: selectedPreviewTheme.textColor,
                }}
              >
                {/* Simulated Header Announcement Bar */}
                <div
                  className="py-1.5 px-4 text-center text-[10px] font-bold tracking-wider truncate"
                  style={{
                    backgroundColor: selectedPreviewTheme.primaryColor,
                    color: selectedPreviewTheme.mode === 'LIGHT' ? '#FFFFFF' : '#070D18',
                  }}
                >
                  {selectedPreviewTheme.announcementTicker}
                </div>

                {/* Simulated Navigation Bar with Constant SVT Logo */}
                <div
                  className="px-4 py-3 flex items-center justify-between border-b"
                  style={{
                    backgroundColor: selectedPreviewTheme.cardBg,
                    borderColor: selectedPreviewTheme.borderColor,
                  }}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4AF37]/20 to-black border border-[#D4AF37]/40 flex items-center justify-center p-0.5 shadow-sm">
                      <VinayakaLogo showText={false} iconSize={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-xs tracking-tight" style={{ color: selectedPreviewTheme.primaryColor }}>
                        SIDHI VINAYAKA TRADERS
                      </span>
                      <span className="text-[8px] opacity-70 uppercase tracking-widest">
                        Uppal • Roastery Direct
                      </span>
                    </div>
                  </div>

                  <span
                    className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${selectedPreviewTheme.primaryColor}20`,
                      color: selectedPreviewTheme.primaryColor,
                      border: `1px solid ${selectedPreviewTheme.primaryColor}40`,
                    }}
                  >
                    {selectedPreviewTheme.heroBadge}
                  </span>
                </div>

                {/* Simulated Hero Section with God Image & Festive Banner */}
                <div className="p-6 sm:p-8 relative overflow-hidden">

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-3 flex-1 text-center sm:text-left">

                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase"
                        style={{
                          backgroundColor: `${selectedPreviewTheme.accentColor}25`,
                          color: selectedPreviewTheme.accentColor,
                        }}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{selectedPreviewTheme.godName}</span>
                      </div>

                      <h4 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                        {selectedPreviewTheme.heroHeadline}
                      </h4>

                      <p className="text-xs opacity-80 max-w-md line-clamp-2">
                        {selectedPreviewTheme.heroSubtitle}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                        <button
                          className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg"
                          style={{
                            backgroundColor: selectedPreviewTheme.primaryColor,
                            color: selectedPreviewTheme.mode === 'LIGHT' ? '#FFFFFF' : '#070D18',
                          }}
                        >
                          Shop Festive Cashews
                        </button>
                        <button
                          className="px-4 py-2 rounded-xl text-xs font-bold border"
                          style={{
                            borderColor: selectedPreviewTheme.borderColor,
                            color: selectedPreviewTheme.textColor,
                            backgroundColor: `${selectedPreviewTheme.cardBg}80`,
                          }}
                        >
                          Explore Hampers
                        </button>
                      </div>
                    </div>

                    {/* God Avatar Card with unoptimized fallback */}
                    <div
                      className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 shadow-2xl shrink-0 bg-black/40"
                      style={{ borderColor: selectedPreviewTheme.primaryColor }}
                    >
                      <Image
                        src={selectedPreviewTheme.godImageUrl}
                        alt={selectedPreviewTheme.godName}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  </div>

                </div>

                {/* Simulated Product Card Grid */}
                <div
                  className="p-4 sm:p-6 border-t"
                  style={{
                    borderColor: selectedPreviewTheme.borderColor,
                    backgroundColor: `${selectedPreviewTheme.cardBg}60`,
                  }}
                >
                  <p className="text-[10px] font-black uppercase tracking-wider mb-3 opacity-75">Festive Handcrafted Selection</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { title: 'W180 King Jumbo (1kg)', price: '₹900', img: '/images/raw_cashews_hero.webp', tag: 'Supreme' },
                      { title: 'Tandoori Masala (1kg)', price: '₹880', img: '/images/tandoori_cashews_hero.webp', tag: 'Party Crunch' },
                      { title: 'Royal Gift Tin (500g)', price: '₹550', img: '/images/raw_cashews_hero.webp', tag: 'Festive Box' },
                    ].slice(0, previewViewport === 'mobile' ? 2 : 3).map((prod, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl border space-y-1.5"
                        style={{
                          backgroundColor: selectedPreviewTheme.cardBg,
                          borderColor: selectedPreviewTheme.borderColor,
                        }}
                      >
                        <div className="relative h-16 w-full rounded-lg overflow-hidden bg-black/20">
                          <Image src={prod.img} alt={prod.title} fill className="object-cover" />
                          <span
                            className="absolute top-1 left-1 text-[8px] font-black uppercase px-1 py-0.5 rounded"
                            style={{
                              backgroundColor: selectedPreviewTheme.primaryColor,
                              color: selectedPreviewTheme.mode === 'LIGHT' ? '#FFFFFF' : '#070D18',
                            }}
                          >
                            {prod.tag}
                          </span>
                        </div>
                        <p className="font-bold text-[11px] truncate">{prod.title}</p>
                        <p className="font-black text-xs" style={{ color: selectedPreviewTheme.primaryColor }}>{prod.price}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>

        </main>
      </div>
    </AdminGuard>
  );
}
