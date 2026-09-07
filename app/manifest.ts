import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sidhi Vinayaka Traders - Premium Cashews',
    short_name: 'SVT Cashews',
    description: 'Order 100% natural, premium jumbo cashews, Peri Peri, Tandoori Masala & Raw Cashews directly from Uppal, Hyderabad.',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf8f5',
    theme_color: '#d97706',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
