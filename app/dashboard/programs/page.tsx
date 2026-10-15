'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Edit3, Image as ImageIcon, CheckCircle, Eye, AlertCircle, Clock, X, ChevronRight } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';

interface Program {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  poster_url: string;
  status: 'published' | 'draft';
  posted_by: string;
  created_at: string;
}

export default function DashboardProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  
  // Modal/Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPrograms = () => {
    fetch('/api/programs')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.programs) {
          setPrograms(data.programs);
        }
      })
      .catch((err) => console.error('Error fetching programs:', err));
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingProgram(null);
    setTitle('');
    setDescription('');
    setEventDate('');
    setEventTime('');
    setPosterUrl('https://picsum.photos/seed/' + Math.random().toString(36).substr(2, 5) + '/800/600');
    setStatus('published');
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (prog: Program) => {
    setEditingProgram(prog);
    setTitle(prog.title);
    setDescription(prog.description);
    setEventDate(prog.event_date);
    setEventTime(prog.event_time);
    setPosterUrl(prog.poster_url);
    setStatus(prog.status);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !eventDate || !eventTime) {
      setErrorMsg('Title, Date, and Time are required.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const payload = {
      id: editingProgram?.id || undefined,
      title,
      description,
      event_date: eventDate,
      event_time: eventTime,
      poster_url: posterUrl,
      status,
    };

    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setModalOpen(false);
        fetchPrograms();
      } else {
        setErrorMsg(data.error || 'Failed to save program.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this program? This action is irreversible.')) {
      return;
    }

    try {
      const response = await fetch(`/api/programs?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPrograms();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete program.');
      }
    } catch (error) {
      console.error(error);
      alert('A network error occurred.');
    }
  };

  const now = new Date();
  
  // Filter programs based on selected tab (upcoming vs past)
  const upcomingPrograms = programs.filter((p) => new Date(`${p.event_date}T${p.event_time}`) >= now);
  const pastPrograms = programs.filter((p) => new Date(`${p.event_date}T${p.event_time}`) < now);

  const displayedPrograms = activeTab === 'upcoming' ? upcomingPrograms : pastPrograms;

  return (
    <DashboardShell>
      <div className="space-y-6" id="dashboard-programs-container">
        
        {/* Header Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          {/* Tabs Selector */}
          <div className="flex space-x-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
                activeTab === 'upcoming' ? 'bg-white text-deep-navy shadow' : 'text-gray-500 hover:text-gray-700'
              }`}
              id="programs-tab-upcoming"
            >
              Upcoming ({upcomingPrograms.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
                activeTab === 'past' ? 'bg-white text-deep-navy shadow' : 'text-gray-500 hover:text-gray-700'
              }`}
              id="programs-tab-past"
            >
              Past / Passed ({pastPrograms.length})
            </button>
          </div>

          <button
            onClick={handleOpenCreateModal}
            id="create-program-btn"
            className="bg-deep-navy text-royal-gold hover:text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Special Program</span>
          </button>
        </div>

        {/* Programs Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" id="programs-table-container">
          {displayedPrograms.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Poster</th>
                    <th className="px-6 py-4">Title & Description</th>
                    <th className="px-6 py-4">Event Schedule</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                  {displayedPrograms.map((prog) => (
                    <tr key={prog.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200">
                          <img
                            src={prog.poster_url}
                            alt=""
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-sm">
                        <h5 className="font-serif font-bold text-deep-navy leading-snug">{prog.title}</h5>
                        <p className="text-gray-500 text-xs mt-1 leading-normal line-clamp-2">{prog.description}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                        <div className="flex flex-col text-gray-600">
                          <span className="font-bold text-deep-navy">{prog.event_date}</span>
                          <span className="text-[10px] mt-0.5">{prog.event_time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            prog.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {prog.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(prog)}
                            id={`edit-prog-btn-${prog.id}`}
                            className="p-2 bg-gray-50 hover:bg-royal-gold/15 hover:text-royal-gold text-gray-500 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProgram(prog.id)}
                            id={`delete-prog-btn-${prog.id}`}
                            className="p-2 bg-gray-50 hover:bg-rose-50 hover:text-rose-600 text-gray-500 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center text-gray-400 space-y-3">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 shrink-0" />
              <h5 className="font-serif text-sm font-semibold">No Programs Listed</h5>
              <p className="text-xs">There are no {activeTab} programs in our records. Click Create above to add one!</p>
            </div>
          )}
        </div>

        {/* Modal form */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" id="program-modal">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto relative">
              
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="text-xl font-serif font-bold text-deep-navy mb-4 border-b border-royal-gold/25 pb-2">
                {editingProgram ? 'Edit Special Program' : 'Create Special Program'}
              </h4>

              {errorMsg && (
                <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSaveProgram} className="space-y-4" id="program-form">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Program Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Theme of program..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Event Date *</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Event Time *</label>
                    <input
                      type="time"
                      required
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short agenda details, guest speaker information, venue, etc..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Poster Graphic URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={posterUrl}
                      onChange={(e) => setPosterUrl(e.target.value)}
                      placeholder="https://picsum.photos/..."
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setPosterUrl('https://picsum.photos/seed/' + Math.random().toString(36).substr(2, 5) + '/800/600')}
                      className="bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600 px-3 rounded-xl flex items-center justify-center transition-colors"
                      title="Generate new placeholder seed"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 border-t border-gray-100 pt-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Publish Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800 font-semibold"
                    >
                      <option value="published">Published (Visible on landing)</option>
                      <option value="draft">Draft (Admin hidden)</option>
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
                    className="bg-deep-navy text-royal-gold hover:text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>{loading ? 'Saving...' : 'Save Program'}</span>
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
