import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { ThemeConfig } from '@/lib/models/ThemeConfig';
import HomepageSettings from '@/lib/models/HomepageSettings';
import { PRESET_FESTIVAL_THEMES, FestivalThemePreset } from '@/lib/festival-themes';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db && ThemeConfig) {
      const config = await ThemeConfig.findOne();
      if (config) {
        let activeTheme = config.activeTheme || PRESET_FESTIVAL_THEMES.find(t => t.id === 'royal-gold');
        if (config.activeThemeId === 'royal-gold' || !activeTheme) {
          activeTheme = PRESET_FESTIVAL_THEMES.find(t => t.id === 'royal-gold') || activeTheme;
        }
        return NextResponse.json({
          success: true,
          activeThemeId: config.activeThemeId || 'royal-gold',
          activeTheme: activeTheme,
          presets: PRESET_FESTIVAL_THEMES,
          customThemes: config.customThemes || [],
        });
      }
    }

    // Default fallback
    const defaultTheme = PRESET_FESTIVAL_THEMES.find(t => t.id === 'royal-gold') || PRESET_FESTIVAL_THEMES[0];
    return NextResponse.json({
      success: true,
      activeThemeId: 'royal-gold',
      activeTheme: defaultTheme,
      presets: PRESET_FESTIVAL_THEMES,
      customThemes: [],
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      activeThemeId: 'royal-gold',
      activeTheme: PRESET_FESTIVAL_THEMES[PRESET_FESTIVAL_THEMES.length - 1],
      presets: PRESET_FESTIVAL_THEMES,
      customThemes: [],
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, themeId, customTheme, syncHomepageCopy } = body;
    const db = await connectToDatabase();

    // 1. Switch Active Theme
    if (action === 'SET_ACTIVE_THEME' && themeId) {
      // Find theme in presets or custom
      let targetTheme: any = PRESET_FESTIVAL_THEMES.find(t => t.id === themeId);

      let config = db && ThemeConfig ? await ThemeConfig.findOne() : null;
      if (!targetTheme && config && config.customThemes) {
        targetTheme = config.customThemes.find((t: any) => t.id === themeId);
      }

      if (!targetTheme) {
        return NextResponse.json({ success: false, error: 'Theme not found' }, { status: 404 });
      }

      if (db && ThemeConfig) {
        if (!config) {
          config = new ThemeConfig({
            activeThemeId: targetTheme.id,
            activeTheme: targetTheme,
            customThemes: [],
          });
        } else {
          config.activeThemeId = targetTheme.id;
          config.activeTheme = targetTheme as any;
        }
        await config.save();
      }

      // Optionally sync Homepage announcement and headline with festival theme
      if (syncHomepageCopy && db && HomepageSettings) {
        let hp = await HomepageSettings.findOne();
        if (!hp) hp = new HomepageSettings({});
        if (targetTheme.announcementTicker) hp.announcementText = targetTheme.announcementTicker;
        if (targetTheme.heroHeadline) hp.heroTitle = targetTheme.heroHeadline;
        if (targetTheme.heroSubtitle) hp.heroSubtitle = targetTheme.heroSubtitle;
        await hp.save();
      }

      return NextResponse.json({
        success: true,
        message: `Activated theme: "${targetTheme.name}"`,
        activeThemeId: targetTheme.id,
        activeTheme: targetTheme,
      });
    }

    // 2. Save / Create Custom Festival Theme
    if (action === 'CREATE_CUSTOM_THEME' && customTheme) {
      const newTheme: FestivalThemePreset = {
        ...customTheme,
        id: customTheme.id || `custom-${Date.now()}`,
        isCustom: true,
        category: 'FESTIVAL',
      };

      if (db && ThemeConfig) {
        let config = await ThemeConfig.findOne();
        if (!config) {
          config = new ThemeConfig({
            activeThemeId: newTheme.id,
            activeTheme: newTheme,
            customThemes: [newTheme],
          });
        } else {
          // Check if updating existing custom theme
          const existingIdx = config.customThemes.findIndex((t: any) => t.id === newTheme.id);
          if (existingIdx > -1) {
            config.customThemes[existingIdx] = newTheme as any;
          } else {
            config.customThemes.push(newTheme as any);
          }
          if (body.activateImmediately) {
            config.activeThemeId = newTheme.id;
            config.activeTheme = newTheme as any;
          }
        }
        await config.save();
      }

      return NextResponse.json({
        success: true,
        message: `Custom Theme "${newTheme.name}" saved successfully!`,
        theme: newTheme,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action parameter' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const themeId = searchParams.get('themeId') || searchParams.get('id');
    if (!themeId) return NextResponse.json({ success: false, error: 'themeId is required' }, { status: 400 });

    const db = await connectToDatabase();
    if (db && ThemeConfig) {
      const config = await ThemeConfig.findOne();
      if (config) {
        config.customThemes = config.customThemes.filter((t: any) => t.id !== themeId);
        if (config.activeThemeId === themeId) {
          config.activeThemeId = 'royal-gold';
          config.activeTheme = PRESET_FESTIVAL_THEMES.find(t => t.id === 'royal-gold') as any;
        }
        await config.save();
      }
    }

    return NextResponse.json({ success: true, message: 'Custom theme deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
