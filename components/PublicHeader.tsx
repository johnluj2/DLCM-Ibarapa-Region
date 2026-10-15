'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ShieldAlert, Heart, Calendar, Radio, Info, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<{ full_name: string; role: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    // Fetch user status
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.authenticated) {
          setUser(data.user);
        }
      })
      .catch(() => {});

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'About Us', href: '/about', icon: Info },
    { label: 'Sermons & Media', href: '/media', icon: Radio },
    { label: 'Connect with Us', href: '/connect', icon: Calendar },
  ];

  return (
    <header
      id="public-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-deep-navy/95 backdrop-blur-md shadow-md border-b border-royal-gold/10 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo / Branding */}
          <Link href="/" className="flex items-center space-x-3 group" id="header-logo-link">
            <div className="w-10 h-10 relative group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Image
                src="/logo.png"
                alt="DCLM Logo"
                fill
                className="object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-white font-serif font-bold text-base sm:text-lg leading-tight tracking-tight group-hover:text-royal-gold transition-colors duration-200">
                DLCM Ibarapa
              </h1>
              <p className="text-royal-gold font-mono text-[9px] uppercase tracking-widest leading-none">
                Ibarapa Region
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" id="desktop-nav">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  id={`nav-link-${item.href.replace('/', '') || 'home'}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-royal-gold text-deep-navy'
                      : 'text-gray-300 hover:text-royal-gold hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3" id="desktop-ctas">
            {user ? (
              <Link
                href="/dashboard"
                id="header-dashboard-btn"
                className="bg-royal-gold/20 text-royal-gold border border-royal-gold/30 hover:bg-royal-gold hover:text-deep-navy px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                id="header-login-btn"
                className="bg-royal-gold text-deep-navy hover:bg-white hover:text-deep-navy px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200"
              >
                Admin Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              id="mobile-menu-toggle"
              className="text-gray-300 hover:text-royal-gold p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-gold"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-deep-navy border-b border-royal-gold/15 shadow-xl overflow-hidden"
            id="mobile-nav-panel"
          >
            <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    id={`mobile-nav-link-${item.href.replace('/', '') || 'home'}`}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-royal-gold text-deep-navy font-semibold'
                        : 'text-gray-300 hover:bg-white/5 hover:text-royal-gold'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="pt-4 pb-2 border-t border-white/5 px-4 flex flex-col space-y-2">
                {user ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    id="mobile-dashboard-btn"
                    className="w-full text-center bg-royal-gold/20 text-royal-gold border border-royal-gold/30 py-3 rounded-lg text-sm font-bold uppercase tracking-wider block"
                  >
                    Dashboard ({user.full_name.split(' ')[0]})
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    id="mobile-login-btn"
                    className="w-full text-center bg-royal-gold text-deep-navy py-3 rounded-lg text-sm font-bold uppercase tracking-wider block"
                  >
                    Admin Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
