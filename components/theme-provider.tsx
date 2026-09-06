'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { FestivalThemePreset, PRESET_FESTIVAL_THEMES } from '@/lib/festival-themes';

interface ThemeContextType {
  activeTheme: FestivalThemePreset;
  activeThemeId: string;
  refreshTheme: () => Promise<void>;
  setLocalTheme: (theme: FestivalThemePreset) => void;
  playFestiveChime: () => void;
}

const defaultTheme = PRESET_FESTIVAL_THEMES.find(t => t.id === 'royal-gold') || PRESET_FESTIVAL_THEMES[0];

const ThemeContext = createContext<ThemeContextType>({
  activeTheme: defaultTheme,
  activeThemeId: defaultTheme.id,
  refreshTheme: async () => {},
  setLocalTheme: () => {},
  playFestiveChime: () => {},
});

export const useFestivalTheme = () => useContext(ThemeContext);

export default function FestivalThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeTheme, setActiveTheme] = useState<FestivalThemePreset>(defaultTheme);
  const [activeThemeId, setActiveThemeId] = useState<string>(defaultTheme.id);

  const applyThemeVariables = (theme: FestivalThemePreset) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    root.style.setProperty('--theme-primary', theme.primaryColor);
    root.style.setProperty('--theme-secondary', theme.secondaryColor);
    root.style.setProperty('--theme-accent', theme.accentColor);
    root.style.setProperty('--theme-bg', theme.backgroundColor);
    root.style.setProperty('--theme-card-bg', theme.cardBg);
    root.style.setProperty('--theme-text', theme.textColor);
    root.style.setProperty('--theme-text-muted', theme.textMuted || '#94A3B8');
    root.style.setProperty('--theme-glow', theme.glowColor);
    root.style.setProperty('--theme-border', theme.borderColor);
    
    root.setAttribute('data-festival-theme', theme.id);
    root.setAttribute('data-festival-mode', (theme.mode || 'DARK').toLowerCase());

    if (document.body) {
      document.body.style.backgroundColor = theme.backgroundColor;
      document.body.style.color = theme.textColor;
    }
  };

  const fetchTheme = async () => {
    try {
      const res = await fetch('/api/admin/theme');
      const data = await res.json();
      if (data.success && data.activeTheme) {
        setActiveTheme(data.activeTheme);
        setActiveThemeId(data.activeThemeId || data.activeTheme.id);
        applyThemeVariables(data.activeTheme);
        try {
          localStorage.setItem('svt_active_festival_theme', JSON.stringify(data.activeTheme));
        } catch { /* ignore */ }
      }
    } catch {
      // Fallback from localStorage
      try {
        const cached = localStorage.getItem('svt_active_festival_theme');
        if (cached) {
          const parsed = JSON.parse(cached);
          setActiveTheme(parsed);
          setActiveThemeId(parsed.id);
          applyThemeVariables(parsed);
        }
      } catch { /* ignore */ }
    }
  };

  useEffect(() => {
    // Initial cached apply
    try {
      const cached = localStorage.getItem('svt_active_festival_theme');
      if (cached) {
        const parsed = JSON.parse(cached);
        setActiveTheme(parsed);
        setActiveThemeId(parsed.id);
        applyThemeVariables(parsed);
      }
    } catch { /* ignore */ }

    fetchTheme();
  }, []);

  const setLocalTheme = (theme: FestivalThemePreset) => {
    setActiveTheme(theme);
    setActiveThemeId(theme.id);
    applyThemeVariables(theme);
  };

  // Synthesize sweet festive chime / temple bell sound effect using Web Audio API
  const playFestiveChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const freqs = activeTheme.id.includes('holi') 
        ? [523.25, 659.25, 783.99, 1046.50] // Bright C major
        : activeTheme.id.includes('eid')
        ? [440.00, 554.37, 659.25, 880.00] // A major oriental harmonic
        : [587.33, 739.99, 880.00, 1174.66]; // D major divine temple bell
        
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 1.3);
      });
    } catch {
      // Audio context might be restricted before user interaction
    }
  };

  return (
    <ThemeContext.Provider value={{ activeTheme, activeThemeId, refreshTheme: fetchTheme, setLocalTheme, playFestiveChime }}>
      
      {/* Dynamic Ambient Background Pattern Overlay */}
      {activeTheme.bgPattern === 'mandala' && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(circle at center, ${activeTheme.primaryColor} 1.5px, transparent 1.5px)`,
            backgroundSize: '36px 36px',
          }}
        />
      )}

      {activeTheme.bgPattern === 'rangoli' && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.045] mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, ${activeTheme.secondaryColor} 2px, transparent 2px)`,
            backgroundSize: '28px 28px',
          }}
        />
      )}

      {activeTheme.bgPattern === 'crescent-stars' && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, ${activeTheme.accentColor} 1.5px, transparent 1.5px), radial-gradient(circle at 80% 80%, ${activeTheme.primaryColor} 1px, transparent 1px)`,
            backgroundSize: '54px 54px',
          }}
        />
      )}

      {activeTheme.bgPattern === 'diya-pattern' && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(ellipse at 50% 50%, ${activeTheme.primaryColor} 2px, transparent 2px)`,
            backgroundSize: '44px 44px',
          }}
        />
      )}

      {/* 🪔 DIWALI AMBIENT ANIMATION: Floating Glowing Diyas & Rising Embers */}
      {activeTheme.ambientEffect === 'diya-sparks' && (
        <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden opacity-50 select-none">
          <div className="absolute top-10 left-[15%] text-base animate-bounce shadow-[0_0_20px_#FFD700]">🪔</div>
          <div className="absolute top-1/3 right-[18%] text-sm animate-pulse text-[#FF5722] shadow-[0_0_24px_#FF5722]">🪔</div>
          <div className="absolute bottom-1/4 left-[22%] text-sm animate-bounce text-[#FFD700]">🪔</div>
          <div className="absolute top-2/3 right-[12%] text-xs animate-pulse text-[#FFA000]">✨</div>
          <div className="absolute top-1/4 left-[45%] w-2 h-2 rounded-full bg-[#FFD700] shadow-[0_0_16px_#FFD700] animate-ping" />
          <div className="absolute bottom-1/3 right-[35%] w-2.5 h-2.5 rounded-full bg-[#FF5722] shadow-[0_0_18px_#FF5722] animate-pulse" />
        </div>
      )}

      {/* 🎨 HOLI AMBIENT ANIMATION: Multi-Color Gulal Powder Clouds & Bursts */}
      {activeTheme.ambientEffect === 'gulal-burst' && (
        <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden opacity-30 select-none">
          <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full bg-gradient-to-br from-[#FF007F] via-[#FFBE0B] to-transparent blur-3xl animate-pulse" />
          <div className="absolute bottom-10 -right-10 w-80 h-80 rounded-full bg-gradient-to-tl from-[#00F5D4] via-[#8338EC] to-transparent blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/4 text-sm animate-bounce">🎨</div>
          <div className="absolute top-1/3 right-1/4 text-sm animate-ping">✨</div>
          <div className="absolute bottom-1/4 left-1/3 text-xs animate-bounce text-[#FF007F]">🌸</div>
        </div>
      )}

      {/* 🌸 PUJA / PONGAL / GANESH AMBIENT ANIMATION: Marigold & Rose Petal Shower */}
      {activeTheme.ambientEffect === 'golden-petals' && (
        <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden opacity-40 select-none">
          <div className="absolute top-6 left-[18%] text-base animate-bounce">🌸</div>
          <div className="absolute top-1/4 right-[22%] text-sm animate-pulse text-[#FFD700]">🌼</div>
          <div className="absolute bottom-1/3 left-[15%] text-base animate-bounce">🏵️</div>
          <div className="absolute top-2/3 right-[28%] text-xs animate-pulse text-[#E65100]">✨</div>
          <div className="absolute top-1/2 left-[40%] text-sm animate-bounce">🪷</div>
        </div>
      )}

      {/* 🌙 EID AMBIENT ANIMATION: Crescent Moon, Starlight & Emerald Lanterns */}
      {activeTheme.ambientEffect === 'crescent-stars' && (
        <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden opacity-45 select-none">
          <div className="absolute top-12 right-[20%] text-lg text-[#D4AF37] animate-pulse">🌙</div>
          <div className="absolute top-1/4 left-[14%] text-sm text-[#10B981] animate-ping">✨</div>
          <div className="absolute bottom-1/3 right-[16%] text-sm text-[#34D399] animate-bounce">⭐</div>
          <div className="absolute top-2/3 left-[25%] text-xs text-[#D4AF37] animate-pulse">✨</div>
        </div>
      )}

      {/* 🦚 JANMASHTAMI AMBIENT ANIMATION: Peacock Feathers & Flute Shimmer */}
      {activeTheme.ambientEffect === 'peacock-aura' && (
        <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden opacity-40 select-none">
          <div className="absolute top-10 left-[20%] text-lg animate-bounce">🪶</div>
          <div className="absolute top-1/2 right-[15%] text-sm text-[#0284C7] animate-pulse">🪷</div>
          <div className="absolute bottom-1/4 left-[18%] text-xs text-[#D97706] animate-ping">✨</div>
          <div className="absolute top-1/3 right-[30%] text-sm animate-bounce">🎶</div>
        </div>
      )}

      {/* ❄️ CHRISTMAS & HOLIDAY AMBIENT ANIMATION: Gentle Snowflakes & Holiday Sparkles */}
      {activeTheme.ambientEffect === 'snow-stars' && (
        <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden opacity-40 select-none">
          <div className="absolute top-6 left-[22%] text-base text-white animate-pulse">❄️</div>
          <div className="absolute top-20 right-[25%] text-sm text-[#F59E0B] animate-bounce">✨</div>
          <div className="absolute bottom-24 left-[18%] text-base text-white animate-pulse">❅</div>
          <div className="absolute top-1/2 right-[18%] text-sm text-white animate-pulse">⭐</div>
          <div className="absolute bottom-1/3 right-[35%] text-xs text-white animate-bounce">❄️</div>
        </div>
      )}

      {/* 👑 SVT ROASTERY SIGNATURE AMBIENT ANIMATION: 24K Gold Embers */}
      {activeTheme.ambientEffect === 'roastery-gold' && (
        <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden opacity-30 select-none">
          <div className="absolute top-14 left-[28%] w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_16px_#D4AF37] animate-ping" />
          <div className="absolute top-1/2 right-[20%] w-2.5 h-2.5 rounded-full bg-[#38BDF8] shadow-[0_0_18px_#38BDF8] animate-pulse" />
          <div className="absolute bottom-1/4 left-[22%] w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_12px_#D4AF37] animate-pulse" />
        </div>
      )}

      {children}
    </ThemeContext.Provider>
  );
}
