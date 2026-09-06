import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const db = await connectToDatabase();

    if (db && Product) {
      const query = category ? { category: category.toUpperCase() } : {};
      let products = await Product.find(query).sort({ createdAt: -1 });

      // Auto-seed with INITIAL_PRODUCTS if database collection is empty
      if (!products || products.length === 0) {
        try {
          const count = await Product.countDocuments();
          if (count === 0) {
            console.log('Seeding initial products into MongoDB Atlas...');
            await Product.insertMany(
              INITIAL_PRODUCTS.map(p => ({
                title: p.title,
                slug: p.slug,
                category: p.category,
                grade: p.grade,
                flavor: p.flavor,
                price: p.price,
                originalPrice: p.originalPrice,
                discountPercent: p.discountPercent || (p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0),
                stockQuantity: p.stockQuantity || 100,
                lowStockThreshold: p.lowStockThreshold || 15,
                weightOptions: p.weightOptions || ['250g', '500g', '1kg'],
                images: p.images,
                description: p.description,
                shortDescription: p.shortDescription,
                badgeText: p.badgeText,
                benefits: p.benefits || [],
                ingredients: p.ingredients || [],
                nutritionalInfo: p.nutritionalInfo,
                spiceBreakdown: p.spiceBreakdown || [],
                isAvailable: p.isAvailable,
                rating: p.rating || 5.0,
                reviewsCount: p.reviewsCount || 50,
                isBestseller: p.isBestseller || false,
              }))
            );
            products = await Product.find(query).sort({ createdAt: -1 });
          }
        } catch (seedErr) {
          console.warn('Initial product seed error:', seedErr);
        }
      }

      if (products && products.length > 0) {
        return NextResponse.json({ success: true, products });
      }
    }

    // Fallback mock filtering
    let filtered = INITIAL_PRODUCTS;
    if (category) {
      filtered = INITIAL_PRODUCTS.filter(p => p.category === category.toUpperCase());
    }

    return NextResponse.json({
      success: true,
      products: filtered,
      source: 'fallback',
    });
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, products: INITIAL_PRODUCTS, error: error.message },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      category,
      grade,
      flavor,
      price,
      originalPrice,
      discountPercent,
      stockQuantity,
      lowStockThreshold,
      weightOptions,
      images,
      description,
      shortDescription,
      badgeText,
      benefits,
      ingredients,
      nutritionalInfo,
      spiceBreakdown,
      isAvailable,
      isBestseller,
      isFeatured,
    } = body;

    if (!title || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'Title, category, and price are required.' },
        { status: 400 }
      );
    }

    // Generate unique clean slug if missing
    let cleanSlug = slug;
    if (!cleanSlug) {
      cleanSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      cleanSlug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;
    }

    const calculatedDiscount =
      discountPercent ??
      (originalPrice && originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0);

    const productPayload = {
      title,
      slug: cleanSlug,
      category,
      grade: category === 'RAW' ? grade || 'W180' : undefined,
      flavor: category === 'FLAVORED' ? flavor || 'Signature' : undefined,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discountPercent: calculatedDiscount,
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 100,
      lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : 15,
      weightOptions: weightOptions && weightOptions.length > 0 ? weightOptions : ['250g', '500g', '1kg'],
      images: images && images.length > 0 ? images : ['/images/raw_cashews_hero.webp'],
      description: description || 'Freshly processed premium SVT Cashews.',
      shortDescription: shortDescription || '',
      badgeText: badgeText || '',
      benefits: Array.isArray(benefits) ? benefits : [],
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      nutritionalInfo: nutritionalInfo || {
        calories: '553 kcal / 100g',
        protein: '18.2g',
        fats: '43.8g',
        carbs: '30.1g',
      },
      spiceBreakdown: Array.isArray(spiceBreakdown) ? spiceBreakdown : [],
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      rating: 5.0,
      reviewsCount: 1,
      isBestseller: Boolean(isBestseller),
      isFeatured: Boolean(isFeatured),
    };

    const db = await connectToDatabase();

    if (db && Product) {
      const newProduct = await Product.create(productPayload);
      return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      product: { ...productPayload, _id: `prod-${Date.now()}` },
      message: 'Product created (Fallback Mode)',
    });
  } catch (error: any) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
