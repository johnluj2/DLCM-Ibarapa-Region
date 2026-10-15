'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Youtube, MessageCircle, Heart, Phone, Mail, MapPin } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer id="public-footer" className="bg-deep-navy text-gray-300 border-t border-royal-gold/15">
      {/* Upper Footer section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Column 1: Church Branding & Mission */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 relative shrink-0">
                <Image
                  src="/logo.png"
                  alt="DCLM Logo"
                  fill
                  className="object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-white font-serif font-bold text-lg">DLCM Ibarapa</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-sans">
              {"\"Rooted in the Word. Alive in the Spirit.\""} We are a Bible-believing, holiness-focused ministry dedicated to preaching the raw Gospel of salvation, power, and holiness.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                id="footer-fb-link"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-royal-gold hover:text-deep-navy transition-all duration-200"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                id="footer-yt-link"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-royal-gold hover:text-deep-navy transition-all duration-200"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/2348012345678"
                target="_blank"
                rel="noreferrer"
                id="footer-wa-link"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-royal-gold hover:text-deep-navy transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Service Schedule Summary */}
          <div>
            <h4 className="text-white font-serif font-bold text-base mb-4 border-b border-royal-gold/20 pb-2">
              Our Services
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex justify-between items-start">
                <span className="font-semibold text-gray-300">Sunday Service</span>
                <span className="text-royal-gold text-right">8:00 AM</span>
              </li>
              <li className="flex justify-between items-start">
                <span className="font-semibold text-gray-300">Bible Study (Mon)</span>
                <span className="text-royal-gold text-right">6:00 PM</span>
              </li>
              <li className="flex justify-between items-start">
                <span className="font-semibold text-gray-300">Revival Hour (Thu)</span>
                <span className="text-royal-gold text-right">5:00 PM</span>
              </li>
              <li className="flex justify-between items-start border-t border-white/5 pt-2">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-300">Power Night</span>
                  <span className="text-xs text-gray-500">3rd Thursday</span>
                </div>
                <span className="text-royal-gold text-right font-medium">6:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h4 className="text-white font-serif font-bold text-base mb-4 border-b border-royal-gold/20 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-royal-gold transition-colors duration-150">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-royal-gold transition-colors duration-150">
                  About the Church
                </Link>
              </li>
              <li>
                <Link href="/media" className="hover:text-royal-gold transition-colors duration-150">
                  Sermon Library
                </Link>
              </li>
              <li>
                <Link href="/connect" className="hover:text-royal-gold transition-colors duration-150">
                  Connect & Forms Hub
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-royal-gold transition-colors duration-150">
                  Admin Dashboard Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Venue */}
          <div>
            <h4 className="text-white font-serif font-bold text-base mb-4 border-b border-royal-gold/20 pb-2">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-royal-gold shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  DLCM Ibarapa Regional Headquarters, Igboora, Oyo State, Nigeria
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-royal-gold shrink-0" />
                <span>+234 80 1234 5678</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-royal-gold shrink-0" />
                <span>info@dlcmibarapa.org</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom copyright segment */}
      <div className="bg-black/40 py-6 border-t border-white/5 text-xs text-gray-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} DLCM Ibarapa Region. All rights reserved.
          </div>
          <div className="flex items-center space-x-1">
            <span>Powerfully crafted by</span>
            <span className="text-royal-gold font-bold">Delight Tech Network</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
