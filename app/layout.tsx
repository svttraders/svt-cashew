import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import Header from '@/components/header';
import Footer from '@/components/footer';
import CartDrawer from '@/components/cart-drawer';
import SchemaOrg from '@/components/schema-org';
import FestivalThemeProvider from '@/components/theme-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Sidhi Vinayaka Traders | Premium Flavoured & Raw Cashews Hyderabad',
    template: '%s | Sidhi Vinayaka Traders'
  },
  description: 'Order 100% natural, premium jumbo cashews, Peri Peri, Tandoori Masala, Pudina & Raw Cashews (W180, W210) directly from Sidhi Vinayaka Traders in Uppal, Hyderabad.',
  keywords: [
    'Flavoured Cashews Hyderabad',
    'Raw Cashews Uppal',
    'Sidhi Vinayaka Traders',
    'Peri Peri Cashews',
    'W180 Jumbo Cashews',
    'Best dry fruits shop Hyderabad',
    'Tandoori Cashews Hyderabad',
    'Pudina Cashews Hyderabad',
    'Wholesale cashews Uppal'
  ],
  openGraph: {
    title: 'Sidhi Vinayaka Traders - Supreme Quality Cashews',
    description: 'Fresh, 100% natural raw and flavoured cashews delivered across Hyderabad.',
    locale: 'en_IN',
    type: 'website',
    siteName: 'Sidhi Vinayaka Traders'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} scroll-smooth`}>
      <head>
        <SchemaOrg />
      </head>
      <body className="flex flex-col min-h-screen antialiased">
        <FestivalThemeProvider>
          <Header />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </FestivalThemeProvider>
      </body>
    </html>
  );
}
