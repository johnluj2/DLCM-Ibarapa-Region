'use client';

import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Calendar, HelpCircle, Check, X, ShieldAlert, Heart, Star, Trash2 } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';

interface Submission {
  id: string;
  type: 'testimony' | 'appointment' | 'feedback' | 'contact';
  full_name: string;
  email: string;
  phone: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected' | 'read' | 'unread' | 'confirmed' | 'declined';
  publish_ok?: boolean;
  appt_type?: string;
  appt_date?: string;
  appt_time?: string;
  category?: string;
  created_at: string;
}

export default function DashboardSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<'feedback' | 'testimony' | 'appointment' | 'contact'>('feedback');
  const [userRole, setUserRole] = useState<'ro' | 'admin' | 'developer' | null>(null);

  const fetchSubmissions = () => {
    fetch('/api/submissions')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.submissions) {
          setSubmissions(data.submissions);
        }
      })
      .catch((err) => console.error('Error fetching submissions:', err));
  };

  useEffect(() => {
    fetchSubmissions();
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.authenticated) setUserRole(data.user.role);
      });
  }, []);

  const handleUpdateStatus = async (id: string, nextStatus: Submission['status']) => {
    if (userRole === 'ro') {
      alert('Access Denied: The Regional Overseer has read-only permission for bookings and moderation. Actions must be taken by Church Admin.');
      return;
    }

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', id, status: nextStatus }),
      });

      if (response.ok) {
        fetchSubmissions();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update status.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (userRole === 'ro') {
      alert('Access Denied: Read-only access.');
      return;
    }
    if (!confirm('Are you sure you want to delete this inbox submission?')) return;

    try {
      const response = await fetch(`/api/submissions?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSubmissions();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Filter list by active tab
  const displayedList = submissions.filter((s) => s.type === activeTab);

  const tabs = [
    { id: 'feedback', label: 'Submit Feedbacks', icon: MessageSquare, count: submissions.filter((s) => s.type === 'feedback' && s.status === 'unread').length },
    { id: 'testimony', label: 'Share Testimonies', icon: Heart, count: submissions.filter((s) => s.type === 'testimony' && s.status === 'pending').length },
    { id: 'appointment', label: 'Pastoral Bookings', icon: Calendar, count: submissions.filter((s) => s.type === 'appointment' && s.status === 'pending').length },
    { id: 'contact', label: 'General Contacts', icon: Mail, count: submissions.filter((s) => s.type === 'contact' && s.status === 'unread').length },
  ];

  return (
    <DashboardShell>
      <div className="space-y-6" id="dashboard-submissions-container">
        
        {/* Read-only restriction reminder for RO role */}
        {userRole === 'ro' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5">
            <ShieldAlert className="w-4.5 h-4.5 text-amber-600 shrink-0" />
            <span>
              <strong>Read-Only Notice:</strong> Regional Overseer may audit these records. Confirming bookings, deleting items, and approving testimonies is restricted to Church Admin and Developers.
            </span>
          </div>
        )}

        {/* Tab Headers selector bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm" id="submissions-tab-selectors">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                id={`sub-tab-btn-${t.id}`}
                className={`p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'bg-deep-navy text-royal-gold border-deep-navy'
                    : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{t.label}</span>
                </div>
                {t.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold ${isActive ? 'bg-royal-gold text-deep-navy' : 'bg-rose-100 text-rose-700'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Submissions Inbox Display Cards */}
        <div className="space-y-4" id="submissions-inbox-flow">
          {displayedList.length > 0 ? (
            displayedList.map((item) => (
              <div
                key={item.id}
                id={`submission-item-${item.id}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-6 hover:border-royal-gold/15 transition-all"
              >
                
                {/* Left block: details */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-serif font-bold text-deep-navy text-sm sm:text-base leading-none block">{item.full_name}</span>
                    
                    {/* Category if feedback */}
                    {item.category && (
                      <span className="bg-gray-100 border border-gray-200 text-gray-600 font-mono text-[9px] uppercase px-1.5 py-0.5 rounded leading-none">
                        Category: {item.category}
                      </span>
                    )}

                    {/* Booking details if appointment */}
                    {item.appt_type && (
                      <span className="bg-royal-gold/10 border border-royal-gold/20 text-royal-gold font-mono text-[9px] uppercase px-1.5 py-0.5 rounded leading-none font-bold">
                        Type: {item.appt_type}
                      </span>
                    )}

                    {/* Date/Time badge if appointment */}
                    {item.appt_date && (
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-[9px] px-1.5 py-0.5 rounded leading-none font-semibold">
                        📅 {item.appt_date} ({item.appt_time})
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap text-xs text-gray-400 gap-x-4 gap-y-1 font-mono">
                    {item.phone && <span>📞 {item.phone}</span>}
                    {item.email && <span>✉️ {item.email}</span>}
                    <span>🕒 Posted: {item.created_at}</span>
                  </div>

                  {/* Message body */}
                  <div className="bg-gray-50 border border-gray-100/50 rounded-xl p-4 text-xs sm:text-sm text-gray-700 leading-relaxed font-sans font-medium whitespace-pre-line">
                    {item.message}
                  </div>

                  {/* Permission warning for testimony */}
                  {item.type === 'testimony' && (
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-gray-400 font-mono">
                      <span>Publish permitted:</span>
                      {item.publish_ok ? (
                        <span className="text-emerald-600 uppercase">Yes (Granted)</span>
                      ) : (
                        <span className="text-rose-600 uppercase">No (Private)</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right block: Action control and status */}
                <div className="flex flex-col items-start md:items-end justify-between shrink-0 space-y-4 md:text-right">
                  {/* Status label badge */}
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">STATUS</span>
                    <span
                      className={`inline-block px-2.5 py-1 rounded text-xs font-mono font-bold uppercase border ${
                        item.status === 'approved' || item.status === 'confirmed'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : item.status === 'rejected' || item.status === 'declined'
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Action buttons (Disabled for R.O.) */}
                  <div className="flex gap-2">
                    {/* Testimony Action triggers */}
                    {item.type === 'testimony' && item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'approved')}
                          id={`testimony-approve-btn-${item.id}`}
                          disabled={userRole === 'ro'}
                          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Publish</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'rejected')}
                          id={`testimony-reject-btn-${item.id}`}
                          disabled={userRole === 'ro'}
                          className="bg-gray-100 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 text-gray-500 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {/* Booking actions */}
                    {item.type === 'appointment' && item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'confirmed')}
                          id={`appt-confirm-btn-${item.id}`}
                          disabled={userRole === 'ro'}
                          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'declined')}
                          id={`appt-decline-btn-${item.id}`}
                          disabled={userRole === 'ro'}
                          className="bg-gray-100 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 text-gray-500 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline Appointment</span>
                        </button>
                      </>
                    )}

                    {/* Feedback / Contact read togglers */}
                    {(item.type === 'feedback' || item.type === 'contact') && item.status === 'unread' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'read')}
                        id={`mark-read-btn-${item.id}`}
                        disabled={userRole === 'ro'}
                        className="bg-deep-navy text-royal-gold hover:text-white disabled:opacity-50 font-bold text-xs px-4 py-2 rounded-lg flex items-center space-x-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark as Handled</span>
                      </button>
                    )}

                    {/* Delete entry */}
                    <button
                      onClick={() => handleDeleteSubmission(item.id)}
                      id={`delete-sub-btn-${item.id}`}
                      disabled={userRole === 'ro'}
                      className="p-2 bg-gray-50 border border-gray-150 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 text-gray-400 rounded-lg transition-colors cursor-pointer"
                      title="Delete forever"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400 space-y-3 shadow-sm">
              <Mail className="w-12 h-12 mx-auto text-gray-300 shrink-0" />
              <h5 className="font-serif text-sm font-semibold">Inbox is Clean</h5>
              <p className="text-xs">There are no submissions currently categorized under {activeTab}.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
