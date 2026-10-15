'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Radio, MessageSquare, Calendar, Mail, FileAudio, Users, ExternalLink, ShieldCheck, ArrowRight, Save, Play, CheckCircle } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';

interface UserMe {
  id: string;
  full_name: string;
  role: 'ro' | 'admin' | 'developer';
}

interface Stats {
  pendingTestimonies: number;
  pendingBookings: number;
  unreadFeedback: number;
  newsletterSubscribers: number;
  totalDownloads: number;
}

export default function DashboardOverviewPage() {
  const [user, setUser] = useState<UserMe | null>(null);
  const [stats, setStats] = useState<Stats>({
    pendingTestimonies: 0,
    pendingBookings: 0,
    unreadFeedback: 0,
    newsletterSubscribers: 0,
    totalDownloads: 0,
  });

  // Broadcast settings
  const [streamUrl, setStreamUrl] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  useEffect(() => {
    // 1. Fetch current user role
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.authenticated) setUser(data.user);
      });

    // 2. Fetch live settings
    fetch('/api/broadcast')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.broadcast) {
          setStreamUrl(data.broadcast.stream_url);
          setIsLive(data.broadcast.is_live);
        }
      });

    // 3. Compile Stats
    Promise.all([
      fetch('/api/submissions').then((res) => (res.ok ? res.json() : { submissions: [] })),
      fetch('/api/newsletter').then((res) => (res.ok ? res.json() : { subscribers: [] })),
      fetch('/api/highlights').then((res) => (res.ok ? res.json() : { highlights: [] })),
    ])
      .then(([submissionsData, newsletterData, highlightsData]) => {
        const subs = submissionsData.submissions || [];
        const subscrs = newsletterData.subscribers || [];
        const highls = highlightsData.highlights || [];

        const pendingTestimonies = subs.filter((s: any) => s.type === 'testimony' && s.status === 'pending').length;
        const pendingBookings = subs.filter((s: any) => s.type === 'appointment' && s.status === 'pending').length;
        const unreadFeedback = subs.filter((s: any) => (s.type === 'feedback' || s.type === 'contact') && s.status === 'unread').length;
        const newsletterSubscribers = subscrs.filter((s: any) => s.status === 'active').length;
        const totalDownloads = highls.reduce((sum: number, curr: any) => sum + (curr.download_count || 0), 0);

        setStats({
          pendingTestimonies,
          pendingBookings,
          unreadFeedback,
          newsletterSubscribers,
          totalDownloads,
        });
      })
      .catch((err) => console.error('Error fetching dashboard stats:', err));
  }, []);

  const handleBroadcastSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role === 'ro') return; // RO cannot modify

    setBroadcastLoading(true);
    setBroadcastSuccess(false);

    try {
      const response = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stream_url: streamUrl, is_live: isLive }),
      });

      if (response.ok) {
        setBroadcastSuccess(true);
        setTimeout(() => setBroadcastSuccess(false), 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setBroadcastLoading(false);
    }
  };

  const statCards = [
    { label: 'Pending Testimonies', value: stats.pendingTestimonies, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', icon: MessageSquare, href: '/dashboard/submissions' },
    { label: 'Unconfirmed Bookings', value: stats.pendingBookings, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100', icon: Calendar, href: '/dashboard/submissions' },
    { label: 'New Feedback Inbox', value: stats.unreadFeedback, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', icon: Mail, href: '/dashboard/submissions' },
    { label: 'Active Subscribers', value: stats.newsletterSubscribers, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', icon: Users, href: '/dashboard/newsletter' },
    { label: 'Sermon Downloads', value: stats.totalDownloads, color: 'text-royal-gold', bg: 'bg-royal-gold/10 border-royal-gold/15', icon: FileAudio, href: '/dashboard/sermons' },
  ];

  return (
    <DashboardShell>
      <div className="space-y-8" id="dashboard-overview-container">
        
        {/* Welcome Banner */}
        {user && (
          <div className="bg-gradient-to-r from-deep-navy via-deep-navy/90 to-deep-navy/85 rounded-2xl p-6 sm:p-8 text-white border border-royal-gold/15 shadow-xl">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-1">
              Welcome Back, {user.full_name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300">
              Your session is active with secure, role-restricted access. Manage church programs, audit feedback, and oversee spiritual resources.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" id="stats-grid">
          {statCards.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.label}
                href={c.href}
                className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-all bg-white hover:border-royal-gold/25`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">{c.label}</span>
                  <div className={`p-2 rounded-xl ${c.bg}`}>
                    <Icon className={`w-4 h-4 ${c.color}`} />
                  </div>
                </div>
                <h4 className="text-2xl sm:text-3xl font-serif font-extrabold text-deep-navy mt-4">{c.value}</h4>
              </Link>
            );
          })}
        </div>

        {/* Action Center splits */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Column 1: Live Broadcast control */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
              <div className="w-10 h-10 bg-royal-gold/15 rounded-lg flex items-center justify-center">
                <Radio className="w-5 h-5 text-royal-gold animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-serif font-bold text-deep-navy">Live Broadcast Control</h4>
                <p className="text-[10px] text-gray-400 font-mono">MANAGE HOMEPAGE EMBEDDED STREAM</p>
              </div>
            </div>

            <form onSubmit={handleBroadcastSave} className="space-y-4" id="broadcast-control-form">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">YouTube / Facebook Embed URL</label>
                <input
                  type="text"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  disabled={user?.role === 'ro'}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-mono text-gray-800 focus:outline-none focus:ring-1 focus:ring-royal-gold disabled:opacity-50"
                  id="broadcast-stream-url-input"
                />
                <span className="text-[10px] text-gray-400 mt-1 block leading-relaxed">
                  Provide a valid `embed` source URL (e.g., must contain `/embed/`). Plain stream watch links will fail to embed on some browsers due to security policies.
                </span>
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <h5 className="text-xs font-bold text-deep-navy">🔴 Broadcast Active Indicator</h5>
                  <p className="text-[10px] text-gray-400">{"Controls the \"LIVE NOW\" badge on the landing page"}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLive}
                    onChange={(e) => setIsLive(e.target.checked)}
                    disabled={user?.role === 'ro'}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-gold disabled:opacity-50" />
                </label>
              </div>

              {user?.role === 'ro' ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl text-xs font-semibold leading-normal">
                  Regional Overseer has read-only access to stream parameters. Day-to-day link management must be completed by Church Admin or Developer.
                </div>
              ) : (
                <div className="flex items-center justify-end">
                  {broadcastSuccess && (
                    <span className="text-xs text-emerald-600 font-bold mr-4 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Broadcast updated!
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={broadcastLoading}
                    id="broadcast-save-btn"
                    className="bg-deep-navy text-royal-gold hover:text-white font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-xl flex items-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{broadcastLoading ? 'Saving...' : 'Update Settings'}</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Column 2: Quick Links / Operations Manual */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <h4 className="text-base font-serif font-bold text-deep-navy border-b border-gray-100 pb-3">
              Operational Actions
            </h4>

            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/dashboard/programs"
                className="p-4 rounded-xl border border-gray-100 hover:border-royal-gold/20 hover:bg-gray-50/50 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-royal-gold" />
                  <div className="text-left">
                    <h5 className="text-xs font-bold text-deep-navy">Add Upcoming Program</h5>
                    <p className="text-[10px] text-gray-400">Post poster graphic and schedule dates</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-royal-gold transition-all" />
              </Link>

              <Link
                href="/dashboard/highlights"
                className="p-4 rounded-xl border border-gray-100 hover:border-royal-gold/20 hover:bg-gray-50/50 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FileAudio className="w-5 h-5 text-royal-gold" />
                  <div className="text-left">
                    <h5 className="text-xs font-bold text-deep-navy">Upload Audio Sermon</h5>
                    <p className="text-[10px] text-gray-400">Upload MP3 message files & past summaries</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-royal-gold transition-all" />
              </Link>

              <Link
                href="/dashboard/submissions"
                className="p-4 rounded-xl border border-gray-100 hover:border-royal-gold/20 hover:bg-gray-50/50 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-royal-gold" />
                  <div className="text-left">
                    <h5 className="text-xs font-bold text-deep-navy">Moderate Submissions</h5>
                    <p className="text-[10px] text-gray-400">Confirm bookings and approve testimonies</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-royal-gold transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
