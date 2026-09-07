import React from 'react';
import Link from 'next/link';
import VinayakaLogo from '@/components/vinayaka-logo';
import { MapPin, Phone, Mail, Award, ShieldCheck, Clock, ArrowUpRight } from 'lucide-react';
import { DirectFarmIllustration, QualityAssuredIllustration } from '@/components/illustrations';

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-300 pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Brand & Origin */}
          <div className="space-y-4">
            <Link href="/" className="inline-block group">
              <VinayakaLogo iconSize={44} layout="horizontal" />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct processing and wholesale distribution hub in Uppal, Hyderabad. Supplying supreme quality King Jumbo W180 and gourmet oven-roasted flavoured cashews across India.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-[#D4AF37] font-semibold pt-1">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.75} />
              <span>FSSAI Certified • 100% Pure & Natural</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-white">
              Catalog & Shop
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#shop" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1">
                  <span>W180 King Jumbo Cashews</span>
                </Link>
              </li>
              <li>
                <Link href="/#shop" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1">
                  <span>W210 Supreme Whole</span>
                </Link>
              </li>
              <li>
                <Link href="/#shop" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1">
                  <span>Peri Peri Spiced Cashews</span>
                </Link>
              </li>
              <li>
                <Link href="/#shop" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1">
                  <span>Tandoori Masala Cashews</span>
                </Link>
              </li>
              <li>
                <Link href="/#shop" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1">
                  <span>Pudina Herb Roasted</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Processing Counter & Direct Support */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-white">
              Direct Contact
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" strokeWidth={1.75} />
                <span>1-53/6, Surya Nagar Colony, Uppal, Hyderabad, Telangana - 500039</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" strokeWidth={1.75} />
                <span className="text-slate-200 font-medium">+91 9515273464 / +91 8919620379</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" strokeWidth={1.75} />
                <span>sahuravindra897@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" strokeWidth={1.75} />
                <span>Mon – Sun: 9:00 AM – 9:00 PM</span>
              </div>
            </div>
          </div>

          {/* Col 4: Wholesale & Gifting */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-white">
              Wholesale & Gifting
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Supplying 5kg / 10kg bulk packs for catering, luxury corporate hampers, and festive wedding gifting in Hyderabad.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/919515273464"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#D4AF37] transition-colors"
              >
                <span>WhatsApp Wholesale Desk</span>
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.75} />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Sidhi Vinayaka Traders. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-slate-400 font-medium">
            <Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
            <Link href="/#shop" className="hover:text-[#D4AF37] transition-colors">Shop</Link>
            <Link href="/admin/dashboard" className="hover:text-[#D4AF37] transition-colors">Admin Portal</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
