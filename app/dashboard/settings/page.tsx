'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, ShieldCheck, Plus, Trash2, Key, UserPlus, AlertTriangle, Eye, ShieldAlert, X } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'ro' | 'admin' | 'developer';
  photo_url: string;
}

export default function DashboardSettingsPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  
  // Create user form
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'ro' | 'admin' | 'developer'>('admin');
  const [photoUrl, setPhotoUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchProfiles = () => {
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.profiles) {
          setProfiles(data.profiles);
        }
      })
      .catch((err) => console.error('Error fetching profiles:', err));
  };

  useEffect(() => {
    // Check developer permission
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.authenticated) {
          if (data.user.role !== 'developer') {
            router.push('/dashboard');
          } else {
            setCurrentUser(data.user);
            fetchProfiles();
          }
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handleOpenModal = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setRole('admin');
    setPhotoUrl('https://picsum.photos/seed/' + Math.random().toString(36).substr(2, 5) + '/200/200');
    setErrorMsg(null);
    setSuccessMsg(null);
    setModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setErrorMsg('Email, Password, and Full Name are required.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      action: 'create_user',
      email,
      password,
      full_name: fullName,
      role,
      photo_url: photoUrl,
    };

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg(`Successfully registered new ${role} account: ${fullName}`);
        setModalOpen(false);
        fetchProfiles();
      } else {
        setErrorMsg(data.error || 'Failed to register account.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (profileId: string) => {
    if (profileId === currentUser?.id) {
      alert('Forbidden Action: You cannot delete your own session profile.');
      return;
    }

    if (!confirm('Are you absolutely sure you want to delete this credentials profile? All admin access for this address will terminate.')) {
      return;
    }

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_user', id: profileId }),
      });

      if (response.ok) {
        fetchProfiles();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete user profile.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const roleLabels = {
    ro: 'Regional Overseer',
    admin: 'Church Admin',
    developer: 'Developer superuser',
  };

  const roleColors = {
    ro: 'bg-amber-50 text-amber-800 border-amber-200',
    admin: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    developer: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  };

  return (
    <DashboardShell>
      <div className="space-y-6" id="dashboard-settings-container">
        
        {/* Shield advisory header */}
        <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 p-6 rounded-2xl text-white border border-indigo-500/20 shadow-xl flex items-start space-x-4">
          <ShieldAlert className="w-9 h-9 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-indigo-300">SYSTEM ARCHITECTURE CONSOLE</h4>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Welcome, Developer superuser. This settings panel manages the database credential directory. You can provision roles for Regional Overseers, standard Admins, and system developers. Keep access details highly secured.
            </p>
          </div>
        </div>

        {/* Profiles Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" id="profiles-table-container">
          <div className="p-4 bg-gray-50 border-b border-gray-150 flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">AUTHORIZED ADMIN USERS</span>
            <button
              onClick={handleOpenModal}
              id="create-admin-profile-btn"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Authorized Role</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Avatar</th>
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Security Level</th>
                  <th className="px-6 py-4 text-right">Revoke Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative border border-gray-200">
                        <img
                          src={p.photo_url || 'https://picsum.photos/seed/user/100/100'}
                          alt=""
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-deep-navy">
                      {p.full_name} {p.id === currentUser?.id && <span className="text-[10px] text-indigo-600 font-mono italic">(Current Session)</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-600">
                      {p.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 rounded text-[9px] font-mono font-bold uppercase border ${roleColors[p.role]}`}>
                        {roleLabels[p.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {p.id !== currentUser?.id ? (
                        <button
                          onClick={() => handleDeleteUser(p.id)}
                          id={`revoke-profile-btn-${p.id}`}
                          className="p-2 bg-gray-50 hover:bg-rose-50 hover:text-rose-600 text-gray-400 rounded-lg transition-colors cursor-pointer"
                          title="Revoke and delete credential profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic font-medium">Session Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create user modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" id="register-user-modal">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
              
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="text-xl font-serif font-bold text-deep-navy mb-4 border-b border-royal-gold/25 pb-2 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <span>Register Authorized Profile</span>
              </h4>

              {errorMsg && (
                <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4" id="register-user-form">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Deacon Emmanuel John"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Authorized Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. emmanuel@dlcmibarapa.org"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Login Password *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter login password"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Photo URL</label>
                    <input
                      type="text"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Security Role *</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800 font-semibold"
                    >
                      <option value="admin">Church Admin</option>
                      <option value="ro">Regional Overseer</option>
                      <option value="developer">Developer Superuser</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-500 px-5 py-2.5 rounded-xl text-xs font-bold border border-gray-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>{loading ? 'Creating...' : 'Create Account'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
