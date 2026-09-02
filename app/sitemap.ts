import { MetadataRoute } from 'next';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://svtcashews.com';

  const productUrls = INITIAL_PRODUCTS.map((product) => ({
    url: `${baseUrl}/products/${product.slug || product._id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...productUrls,
  ];
}
