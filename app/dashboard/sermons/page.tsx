'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Download, ShieldCheck, ToggleLeft, ToggleRight, Trash2, HelpCircle } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';

interface Highlight {
  id: string;
  program_name: string;
  program_date: string;
  description: string;
  service_type: string;
  photo_urls: string[];
  video_url: string;
  audio_url: string;
  sermon_title: string;
  preacher_name: string;
  allow_download: boolean;
  download_count: number;
}

export default function DashboardSermonsPage() {
  const [sermons, setSermons] = useState<Highlight[]>([]);

  const fetchSermons = () => {
    fetch('/api/highlights')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.highlights) {
          // Filter out highlights that have no audio url (not a sermon)
          const audioSermons = data.highlights.filter((h: Highlight) => h.audio_url);
          setSermons(audioSermons);
        }
      })
      .catch((err) => console.error('Error fetching sermons:', err));
  };

  useEffect(() => {
    fetchSermons();
  }, []);

  const handleToggleDownload = async (sermon: Highlight) => {
    const updated = {
      ...sermon,
      allow_download: !sermon.allow_download,
    };

    try {
      const response = await fetch('/api/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (response.ok) {
        fetchSermons();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteSermon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this audio sermon from records? This does not delete other highlight media.')) {
      return;
    }

    try {
      const response = await fetch(`/api/highlights?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSermons();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6" id="dashboard-sermons-container">
        
        {/* Info panel */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start space-x-3.5">
          <BookOpen className="w-8 h-8 text-royal-gold shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-deep-navy">Sermon Library Oversight</h4>
            <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
              These audio files are pulled automatically from program highlights that include an uploaded MP3 source URL. Download stats are tracked passively on our server-proxy.
            </p>
          </div>
        </div>

        {/* Table representation */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" id="sermons-table-container">
          {sermons.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Sermon Theme</th>
                    <th className="px-6 py-4">Preacher Name</th>
                    <th className="px-6 py-4">Release Date</th>
                    <th className="px-6 py-4">Total Downloads</th>
                    <th className="px-6 py-4">Allow Download Toggle</th>
                    <th className="px-6 py-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                  {sermons.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 max-w-sm">
                        <h5 className="font-serif font-bold text-deep-navy leading-snug">{s.sermon_title}</h5>
                        <span className="text-[10px] text-gray-400 block font-mono mt-0.5">{s.program_name}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-royal-gold">
                        {s.preacher_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">
                        {s.program_date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-xs font-mono text-gray-700">
                          <Download className="w-4 h-4 mr-1 text-gray-400 shrink-0" />
                          <span>{s.download_count} files</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleDownload(s)}
                          id={`toggle-download-btn-${s.id}`}
                          className="flex items-center space-x-2 text-xs font-semibold focus:outline-none focus:ring-0 cursor-pointer"
                        >
                          {s.allow_download ? (
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> Allowed
                            </span>
                          ) : (
                            <span className="text-gray-400 bg-gray-50 border border-gray-200 px-2 py-1 rounded flex items-center gap-1">
                              <HelpCircle className="w-3.5 h-3.5" /> Forbidden
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDeleteSermon(s.id)}
                          id={`delete-sermon-btn-${s.id}`}
                          className="p-2 bg-gray-50 hover:bg-rose-50 hover:text-rose-600 text-gray-400 rounded-lg transition-colors cursor-pointer"
                          title="Delete sermon file link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center text-gray-400 space-y-3">
              <BookOpen className="w-12 h-12 mx-auto text-gray-300 shrink-0" />
              <h5 className="font-serif text-sm font-semibold">No Audio Sermons Found</h5>
              <p className="text-xs">Go to Highlights, edit or create a program highlight, and attach a valid audio sermon MP3 URL!</p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
