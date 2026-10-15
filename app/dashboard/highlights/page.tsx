'use client';

import { useState, useEffect } from 'react';
import { Film, Trash2, Edit3, Image as ImageIcon, Music, Video, Plus, X, List, Save, Eye } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';

interface Highlight {
  id: string;
  program_name: string;
  program_date: string;
  description: string;
  service_type: 'sunday' | 'bible_study' | 'revival' | 'power_night' | 'special';
  photo_urls: string[];
  video_url: string;
  audio_url: string;
  sermon_title: string;
  preacher_name: string;
  allow_download: boolean;
  download_count: number;
}

export default function DashboardHighlightsPage() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);

  // Form states
  const [programName, setProgramName] = useState('');
  const [programDate, setProgramDate] = useState('');
  const [description, setDescription] = useState('');
  const [serviceType, setServiceType] = useState<Highlight['service_type']>('sunday');
  const [photoUrlsInput, setPhotoUrlsInput] = useState(''); // Comma separated list
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [sermonTitle, setSermonTitle] = useState('');
  const [preacherName, setPreacherName] = useState('');
  const [allowDownload, setAllowDownload] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchHighlights = () => {
    fetch('/api/highlights')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.highlights) {
          setHighlights(data.highlights);
        }
      })
      .catch((err) => console.error('Error fetching highlights:', err));
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingHighlight(null);
    setProgramName('');
    setProgramDate('');
    setDescription('');
    setServiceType('sunday');
    setPhotoUrlsInput('');
    setVideoUrl('');
    setAudioUrl('');
    setSermonTitle('');
    setPreacherName('Pastor J. O. Oyegoke');
    setAllowDownload(true);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (h: Highlight) => {
    setEditingHighlight(h);
    setProgramName(h.program_name);
    setProgramDate(h.program_date);
    setDescription(h.description);
    setServiceType(h.service_type);
    setPhotoUrlsInput(h.photo_urls.join(', '));
    setVideoUrl(h.video_url);
    setAudioUrl(h.audio_url);
    setSermonTitle(h.sermon_title);
    setPreacherName(h.preacher_name);
    setAllowDownload(h.allow_download);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleGeneratePortfolioPhotos = () => {
    const randomSeed = Math.floor(Math.random() * 1000);
    const urls = [
      `https://picsum.photos/seed/church_${randomSeed}/800/600`,
      `https://picsum.photos/seed/singing_${randomSeed}/800/600`,
      `https://picsum.photos/seed/bible_${randomSeed}/800/600`,
    ];
    setPhotoUrlsInput(urls.join(', '));
  };

  const handleSaveHighlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programName || !programDate || !description) {
      setErrorMsg('Program Name, Date, and Description are required.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    // Clean comma separated photo urls
    const photo_urls = photoUrlsInput
      .split(',')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const payload = {
      id: editingHighlight?.id || undefined,
      program_name: programName,
      program_date: programDate,
      description,
      service_type: serviceType,
      photo_urls,
      video_url: videoUrl,
      audio_url: audioUrl,
      sermon_title: sermonTitle,
      preacher_name: preacherName,
      allow_download: allowDownload,
    };

    try {
      const response = await fetch('/api/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setModalOpen(false);
        fetchHighlights();
      } else {
        setErrorMsg(data.error || 'Failed to save highlights.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHighlight = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this highlight? This will remove its associated sermon audio from public lists.')) {
      return;
    }

    try {
      const response = await fetch(`/api/highlights?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchHighlights();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete highlights.');
      }
    } catch (error) {
      console.error(error);
      alert('A network error occurred.');
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6" id="dashboard-highlights-container">
        
        {/* Top Header Controls */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-500 font-mono">POSTED EXPERIENCE REELS</h4>
          <button
            onClick={handleOpenCreateModal}
            id="create-highlight-btn"
            className="bg-deep-navy text-royal-gold hover:text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Program Highlight</span>
          </button>
        </div>

        {/* Highlights Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" id="highlights-table-container">
          {highlights.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Service Type</th>
                    <th className="px-6 py-4">Program Details</th>
                    <th className="px-6 py-4">Sermon & Preacher</th>
                    <th className="px-6 py-4">Sermon Audio</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                  {highlights.map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded bg-royal-gold/10 border border-royal-gold/20 text-royal-gold font-mono text-[9px] uppercase font-bold">
                          {h.service_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <h5 className="font-serif font-bold text-deep-navy leading-snug">{h.program_name}</h5>
                        <span className="text-[10px] text-gray-400 block font-mono">{h.program_date}</span>
                        <p className="text-gray-500 text-xs mt-1 leading-relaxed line-clamp-2">{h.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-serif font-semibold text-deep-navy">{h.sermon_title || 'N/A'}</span>
                          <span className="text-xs text-royal-gold font-bold mt-0.5">{h.preacher_name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                        {h.audio_url ? (
                          <div className="flex flex-col space-y-1">
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">MP3 Online</span>
                            <span className="text-[10px] text-gray-400">{h.download_count} downloads</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 font-semibold italic bg-gray-50 px-2 py-0.5 rounded border border-gray-200">No Audio</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(h)}
                            id={`edit-high-btn-${h.id}`}
                            className="p-2 bg-gray-50 hover:bg-royal-gold/15 hover:text-royal-gold text-gray-500 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteHighlight(h.id)}
                            id={`delete-high-btn-${h.id}`}
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
              <Film className="w-12 h-12 mx-auto text-gray-300 shrink-0" />
              <h5 className="font-serif text-sm font-semibold">No Highlights Posted</h5>
              <p className="text-xs">Provide message extracts or photograph files of past worship meetings. Click Create above.</p>
            </div>
          )}
        </div>

        {/* Create / Edit modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" id="highlight-modal">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto relative">
              
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="text-xl font-serif font-bold text-deep-navy mb-4 border-b border-royal-gold/25 pb-2">
                {editingHighlight ? 'Edit Highlight Portfolio' : 'Create Program Highlight'}
              </h4>

              {errorMsg && (
                <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSaveHighlight} className="space-y-4" id="highlight-form">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Associated Program Name *</label>
                    <input
                      type="text"
                      required
                      value={programName}
                      onChange={(e) => setProgramName(e.target.value)}
                      placeholder="e.g. Sunday Worship Service"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Date of Program *</label>
                    <input
                      type="date"
                      required
                      value={programDate}
                      onChange={(e) => setProgramDate(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Service Type Tag *</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800 font-semibold"
                    >
                      <option value="sunday">Sunday Worship Service</option>
                      <option value="bible_study">Bible Study</option>
                      <option value="revival">Revival Hour</option>
                      <option value="power_night">Power Night</option>
                      <option value="special">Special Program</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Preacher Name</label>
                    <input
                      type="text"
                      value={preacherName}
                      onChange={(e) => setPreacherName(e.target.value)}
                      placeholder="Preacher of the message"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Sermon Title / Theme</label>
                    <input
                      type="text"
                      value={sermonTitle}
                      onChange={(e) => setSermonTitle(e.target.value)}
                      placeholder="Title of message delivered"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Program Summary / Highlight Notes *</label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a written summary of the scriptures, blessings, prayers, and attendance context..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block flex items-center justify-between">
                      <span>Audio Sermon MP3 URL</span>
                      <Music className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    </label>
                    <input
                      type="text"
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      placeholder="https://www.soundhelix.com/...mp3"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block flex items-center justify-between">
                      <span>YouTube Video Highlight URL</span>
                      <Video className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    </label>
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/embed/..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500 mb-1 block flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Portfolio Image URLs (comma separated)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGeneratePortfolioPhotos}
                      className="text-[10px] font-bold text-royal-gold hover:underline"
                    >
                      Generate seed pics
                    </button>
                  </div>
                  <input
                    type="text"
                    value={photoUrlsInput}
                    onChange={(e) => setPhotoUrlsInput(e.target.value)}
                    placeholder="URL1, URL2, URL3..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800 font-mono"
                  />
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <h5 className="text-xs font-bold text-deep-navy">Allow Sermon Download</h5>
                    <p className="text-[10px] text-gray-400 font-sans">Permits users to save the MP3 audio file locally</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowDownload}
                      onChange={(e) => setAllowDownload(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-gold" />
                  </label>
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
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Highlight'}</span>
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
