'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Mail, Lock, LogIn, ArrowLeft, Key, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // If already logged in, redirect directly to dashboard
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.authenticated) {
          router.push('/dashboard');
        }
      })
      .catch(() => {});
  }, [router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setErrorMsg(data.error || 'Invalid email credentials or password.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('A connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  const quickLogins = [
    { label: 'Developer', email: 'dev@dlcmibarapa.org', pass: 'developer2026', bg: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
    { label: 'Regional Overseer', email: 'ro@dlcmibarapa.org', pass: 'overseer2026', bg: 'bg-amber-50 border-amber-200 text-amber-800' },
    { label: 'Church Admin', email: 'admin@dlcmibarapa.org', pass: 'admin2026', bg: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  ];

  return (
    <div className="flex flex-col min-h-screen" id="login-page-root">
      <PublicHeader />

      <section className="flex-1 bg-deep-navy flex items-center justify-center pt-32 pb-16 px-4">
        <div className="max-w-md w-full" id="login-container">
          
          {/* Logo / Heading */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 text-royal-gold hover:text-white mb-4">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Back to homepage</span>
            </Link>
            <div className="w-14 h-14 bg-royal-gold rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Key className="text-deep-navy w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">Admin Portal Login</h2>
            <p className="text-xs text-gray-400 mt-2 font-sans">
              Enter your authorized credentials to access the church dashboard system.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-royal-gold/15">
            {errorMsg && (
              <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-start space-x-2.5 text-xs font-semibold">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5" id="login-form">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Authorized Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@dlcmibarapa.org"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800"
                    id="login-email-input"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Secret Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800"
                    id="login-password-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                id="login-submit-btn"
                className="w-full bg-deep-navy text-royal-gold hover:text-white font-bold uppercase tracking-wider text-xs py-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              </button>
            </form>

            {/* Quick credentials Helper for testing */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3 text-center">
                Auditor Quick-Role Logins
              </span>
              <div className="space-y-2">
                {quickLogins.map((ql) => (
                  <button
                    key={ql.label}
                    onClick={() => handleQuickLogin(ql.email, ql.pass)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between hover:scale-[1.01] transition-transform ${ql.bg}`}
                    id={`quick-login-${ql.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold">{ql.label}</span>
                      <span className="text-[10px] opacity-75">{ql.email}</span>
                    </div>
                    <UserCheck className="w-4 h-4 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
