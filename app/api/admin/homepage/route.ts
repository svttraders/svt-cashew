import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { HomepageSettings, DEFAULT_CATEGORY_CARDS } from '@/lib/models/HomepageSettings';

const DEFAULT_SETTINGS = {
  heroTitle: 'Supreme Quality Handpicked Cashews',
  heroSubtitle: 'Directly sourced from trusted orchards and freshly processed at our facility in Uppal, Hyderabad. Experience unmatched crunch and natural flavor.',
  heroImageUrl: '/images/raw_cashews_hero.webp',
  heroButtonText: 'Shop All Products',
  heroButtonLink: '#shop',
  announcementText: 'Direct Uppal Roastery Counter • 100% Pure W180 Jumbo & Gourmet Spiced Cashews • Wholesale & Retail',
  rawCardImage: '/images/raw_cashews_hero.webp',
  rawCardSubtitle: 'Grade W180 & W210 supreme size whole nuts. Naturally sweet, high crunch.',
  flavoredCardImage: '/images/tandoori_cashews_hero.webp',
  flavoredCardSubtitle: 'Peri Peri, Tandoori Masala & Pudina Herb infused with pure spices.',
  secondaryTitle: 'Artisanal Flavoured Blends',
  secondarySubtitle: 'Slow roasted with rich Indian spices for an irresistible crunch.',
  secondaryImageUrl: '/images/tandoori_cashews_hero.webp',
  secondaryButtonText: 'Explore Flavours',
  secondaryButtonLink: '/category/flavored',
  categoryCards: DEFAULT_CATEGORY_CARDS,
};

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db && HomepageSettings) {
      let settings = await HomepageSettings.findOne().sort({ updatedAt: -1 });
      if (!settings) {
        settings = await HomepageSettings.create(DEFAULT_SETTINGS);
      } else if (!settings.categoryCards || settings.categoryCards.length === 0) {
        settings.categoryCards = DEFAULT_CATEGORY_CARDS as any;
        await settings.save();
      }
      return NextResponse.json({ success: true, settings });
    }

    return NextResponse.json({
      success: true,
      settings: DEFAULT_SETTINGS,
      source: 'fallback',
    });
  } catch (error: any) {
    console.error('GET /api/admin/homepage error:', error);
    return NextResponse.json({
      success: true,
      settings: DEFAULT_SETTINGS,
      error: error.message,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await connectToDatabase();

    if (db && HomepageSettings) {
      let settings = await HomepageSettings.findOne().sort({ updatedAt: -1 });
      if (settings) {
        Object.assign(settings, body);
        await settings.save();
      } else {
        settings = await HomepageSettings.create({ ...DEFAULT_SETTINGS, ...body });
      }
      return NextResponse.json({ success: true, settings });
    }

    return NextResponse.json({
      success: true,
      settings: { ...DEFAULT_SETTINGS, ...body },
      message: 'Updated (Mock Mode)',
    });
  } catch (error: any) {
    console.error('POST /api/admin/homepage error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
