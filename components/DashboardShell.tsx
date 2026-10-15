'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Calendar, Film, BookOpen, Inbox, Mail, Settings, LogOut, Menu, X, ShieldAlert, Radio, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LogoLoader from '@/components/LogoLoader';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'ro' | 'admin' | 'developer';
  photo_url: string;
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.authenticated) {
          // If accessing settings route, enforce Developer role
          if (pathname.includes('/settings') && data.user.role !== 'developer') {
            router.push('/dashboard');
            return;
          }
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Session check failed:', err);
        router.push('/login');
      });
  }, [router, pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-spirit-white flex items-center justify-center p-4" id="dashboard-loading">
        <LogoLoader
          size="md"
          text="Verifying Authorization..."
          subtext="Accessing Deeper Life Ibarapa Management System"
        />
      </div>
    );
  }

  if (!user) return null;

  const menuItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['ro', 'admin', 'developer'] },
    { label: 'Programs', href: '/dashboard/programs', icon: Calendar, roles: ['ro', 'admin', 'developer'] },
    { label: 'Highlights', href: '/dashboard/highlights', icon: Film, roles: ['ro', 'admin', 'developer'] },
    { label: 'Sermon Quick View', href: '/dashboard/sermons', icon: BookOpen, roles: ['ro', 'admin', 'developer'] },
    { label: 'Submissions Inbox', href: '/dashboard/submissions', icon: Inbox, roles: ['ro', 'admin', 'developer'] },
    { label: 'Newsletter Hub', href: '/dashboard/newsletter', icon: Mail, roles: ['ro', 'admin', 'developer'] },
    { label: 'Developer Settings', href: '/dashboard/settings', icon: Settings, roles: ['developer'] },
  ];

  const allowedItems = menuItems.filter((item) => item.roles.includes(user.role));

  const roleLabels = {
    ro: 'Regional Overseer',
    admin: 'Church Admin',
    developer: 'Developer superuser',
  };

  const roleColors = {
    ro: 'bg-amber-100 text-amber-800 border-amber-200',
    admin: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    developer: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans" id="dashboard-shell-root">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-deep-navy text-gray-300 border-r border-royal-gold/10 shrink-0">
        <div className="p-6 border-b border-royal-gold/15 flex items-center space-x-3">
          <div className="w-9 h-9 relative shrink-0">
            <Image
              src="/logo.png"
              alt="DLCM Logo"
              fill
              className="object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-white font-serif font-bold text-sm tracking-tight leading-none">DLCM Dashboard</h1>
            <span className="text-[9px] font-mono text-royal-gold uppercase tracking-widest">Ibarapa Region</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" id="desktop-sidebar-nav">
          {allowedItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`sidebar-link-${item.href.split('/').pop() || 'overview'}`}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors duration-150 ${
                  isActive
                    ? 'bg-royal-gold text-deep-navy shadow-lg shadow-royal-gold/10'
                    : 'text-gray-400 hover:text-royal-gold hover:bg-white/5'
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-royal-gold/15 bg-black/25">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative w-9 h-9 rounded-full bg-white/10 overflow-hidden border border-white/10 shrink-0">
              <Image
                src={user.photo_url || 'https://picsum.photos/seed/user/100/100'}
                alt={user.full_name}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-white font-bold text-xs truncate leading-tight">{user.full_name}</h4>
              <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-mono border font-semibold mt-1 leading-none ${roleColors[user.role]}`}>
                {roleLabels[user.role]}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            id="sidebar-logout-btn"
            className="w-full flex items-center justify-center space-x-2 bg-rose-950/20 hover:bg-rose-900/40 text-rose-400 border border-rose-900/30 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-deep-navy text-white border-b border-royal-gold/10 px-4 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 relative shrink-0">
            <Image
              src="/logo.png"
              alt="DLCM Logo"
              fill
              className="object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-serif font-bold text-sm">DLCM Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          id="mobile-sidebar-toggle"
          className="text-gray-300 hover:text-royal-gold focus:outline-none"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-black/60 flex"
          >
            <motion.div
              initial={{ x: -250 }}
              animate={{ x: 0 }}
              exit={{ x: -250 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-deep-navy w-64 h-full text-gray-300 flex flex-col justify-between"
            >
              <div>
                <div className="p-6 border-b border-royal-gold/15 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 relative shrink-0">
                      <Image
                        src="/logo.png"
                        alt="DLCM Logo"
                        fill
                        className="object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="font-serif font-bold text-sm text-white">DLCM Ibarapa</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="p-4 space-y-1">
                  {allowedItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-royal-gold text-deep-navy'
                            : 'text-gray-400 hover:text-royal-gold hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="p-4 border-t border-royal-gold/15 bg-black/25">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative w-9 h-9 rounded-full bg-white/10 overflow-hidden border border-white/10 shrink-0">
                    <Image
                      src={user.photo_url || 'https://picsum.photos/seed/user/100/100'}
                      alt={user.full_name}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-white font-bold text-xs truncate leading-tight">{user.full_name}</h4>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-mono border font-semibold mt-1 leading-none ${roleColors[user.role]}`}>
                      {roleLabels[user.role]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 bg-rose-950/20 hover:bg-rose-900/40 text-rose-400 border border-rose-900/30 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
            {/* Click outside to close */}
            <div className="flex-1" onClick={() => setSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content body */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-full">
        {/* Simple audit-like indicator */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-deep-navy capitalize">
              {pathname.split('/').pop()?.replace('-', ' ') || 'Overview'}
            </h2>
            <p className="text-[10px] font-mono text-gray-400 uppercase mt-0.5 tracking-wider">
              AUTHORIZED CONTEXT: {user.full_name} ({roleLabels[user.role]})
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 block animate-pulse" />
            <span>Server Secure Connect</span>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
