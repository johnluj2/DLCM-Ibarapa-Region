'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, Users, History, AlertCircle, Trash2, CheckCircle2, FileText, UploadCloud, FileDown } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';

interface Subscriber {
  id: string;
  full_name: string;
  email: string;
  status: 'active' | 'unsubscribed';
  subscribed_at: string;
}

interface Campaign {
  id: string;
  subject: string;
  content: string;
  sent_at: string;
  recipients_count: number;
}

interface NewsletterPdf {
  id: string;
  title: string;
  pdf_url: string;
  publish_date: string;
  description?: string;
  created_at: string;
}

export default function DashboardNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pdfs, setPdfs] = useState<NewsletterPdf[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'subscribers' | 'compose' | 'history' | 'archives'>('subscribers');
  
  // Compose form
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'ro' | 'admin' | 'developer' | null>(null);

  // PDF upload state
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfPublishDate, setPdfPublishDate] = useState('');
  const [pdfDescription, setPdfDescription] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setPdfFile(file);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const fetchData = () => {
    fetch('/api/newsletter')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setSubscribers(data.subscribers || []);
          setCampaigns(data.campaigns || []);
        }
      })
      .catch((err) => console.error('Error fetching newsletter data:', err));
  };

  const fetchPdfs = () => {
    fetch('/api/newsletters')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.newsletters) {
          setPdfs(data.newsletters);
        }
      })
      .catch((err) => console.error('Error fetching PDFs:', err));
  };

  useEffect(() => {
    fetchData();
    fetchPdfs();
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.authenticated) setUserRole(data.user.role);
      });
  }, []);

  const handleUploadPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === 'ro') {
      alert('Access Denied: The Regional Overseer is restricted from uploading newsletters.');
      return;
    }

    if (!pdfFile || !pdfTitle || !pdfPublishDate) {
      setPdfError('File, Title, and Publish Date are required.');
      return;
    }

    setUploadingPdf(true);
    setPdfSuccess(null);
    setPdfError(null);

    const formData = new FormData();
    formData.append('file', pdfFile);
    formData.append('title', pdfTitle);
    formData.append('publishDate', pdfPublishDate);
    formData.append('description', pdfDescription);

    try {
      const response = await fetch('/api/newsletters', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setPdfSuccess('Newsletter bulletin PDF uploaded successfully!');
        setPdfTitle('');
        setPdfPublishDate('');
        setPdfDescription('');
        setPdfFile(null);
        fetchPdfs();
      } else {
        setPdfError(data.error || 'Failed to upload newsletter.');
      }
    } catch (error) {
      console.error(error);
      setPdfError('An unexpected error occurred during upload.');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleDeletePdf = async (id: string) => {
    if (userRole === 'ro') {
      alert('Action forbidden for read-only roles.');
      return;
    }
    if (!confirm('Are you sure you want to delete this newsletter PDF from the archive?')) return;

    try {
      const response = await fetch(`/api/newsletters?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPdfs();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete newsletter.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === 'ro') {
      alert('Access Denied: The Regional Overseer is restricted from sending newsletter campaigns. General broadcast bulletins must be sent by Church Admin.');
      return;
    }

    if (!subject || !content) {
      setErrorMsg('Subject and Bulletin content are required.');
      return;
    }

    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_campaign', subject, content }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg(`Successfully dispatched campaign bulletin to ${data.recipients} active subscribers!`);
        setSubject('');
        setContent('');
        fetchData();
      } else {
        setErrorMsg(data.error || 'Failed to send campaign bulletin.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (id: string) => {
    if (userRole === 'ro') {
      alert('Action forbidden for read-only roles.');
      return;
    }
    if (!confirm('Are you sure you want to change status/unsubscribe this contact?')) return;

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unsubscribe', id }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const activeSubscribers = subscribers.filter((s) => s.status === 'active');

  return (
    <DashboardShell>
      <div className="space-y-6" id="dashboard-newsletter-container">
        
        {/* Navigation bar headers */}
        <div className="flex space-x-1 bg-white p-1.5 rounded-xl border border-gray-150 shadow-sm w-fit overflow-x-auto scrollbar-none" id="newsletter-nav-selectors">
          <button
            onClick={() => setActiveSubTab('subscribers')}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeSubTab === 'subscribers' ? 'bg-deep-navy text-royal-gold shadow' : 'text-gray-500 hover:text-gray-700'
            }`}
            id="news-tab-subscribers"
          >
            Subscribers ({subscribers.length})
          </button>
          <button
            onClick={() => setActiveSubTab('compose')}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeSubTab === 'compose' ? 'bg-deep-navy text-royal-gold shadow' : 'text-gray-500 hover:text-gray-700'
            }`}
            id="news-tab-compose"
          >
            Compose Bulletin
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeSubTab === 'history' ? 'bg-deep-navy text-royal-gold shadow' : 'text-gray-500 hover:text-gray-700'
            }`}
            id="news-tab-history"
          >
            Dispatched Campaigns ({campaigns.length})
          </button>
          <button
            onClick={() => setActiveSubTab('archives')}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeSubTab === 'archives' ? 'bg-deep-navy text-royal-gold shadow' : 'text-gray-500 hover:text-gray-700'
            }`}
            id="news-tab-archives"
          >
            Newsletter PDFs ({pdfs.length})
          </button>
        </div>

        {/* Tab content bodies */}
        {activeSubTab === 'subscribers' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" id="subscribers-table-container">
            {subscribers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Full Name</th>
                      <th className="px-6 py-4">Email Contact</th>
                      <th className="px-6 py-4">Subscription Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                    {subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-deep-navy">
                          {sub.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-xs">
                          {sub.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-400 font-mono text-xs">
                          {sub.subscribed_at}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                              sub.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {sub.status === 'active' ? (
                            <button
                              onClick={() => handleUnsubscribe(sub.id)}
                              disabled={userRole === 'ro'}
                              className="text-xs text-rose-600 hover:underline font-bold disabled:opacity-50 cursor-pointer"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Inactive</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 text-center text-gray-400 space-y-3">
                <Users className="w-12 h-12 mx-auto text-gray-300 shrink-0" />
                <h5 className="font-serif text-sm font-semibold">No Bulletin Subscribers</h5>
                <p className="text-xs">Subscribers will be cataloged when users complete the newsletter block on the Connect page.</p>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'compose' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 max-w-2xl" id="compose-bulletin-card">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4 mb-6">
              <Mail className="w-5 h-5 text-royal-gold shrink-0" />
              <div>
                <h4 className="text-base font-serif font-bold text-deep-navy">Compose Weekly Bulletin</h4>
                <p className="text-[10px] text-gray-400 font-mono uppercase">DISPATCH SPIRITUAL MESSAGES TO {activeSubscribers.length} SUBSCRIBERS</p>
              </div>
            </div>

            {successMsg && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start space-x-3 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-sans leading-normal font-semibold">{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSendCampaign} className="space-y-4" id="campaign-form">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Email Subject *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. DLCM Ibarapa Weekly Nuggets: Rooted and Alive"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Bulletin Message Content * (Markdown/Text)</label>
                <textarea
                  rows={8}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your spiritual nuggets, announcements, and prayers here..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800 resize-none font-sans"
                />
              </div>

              {userRole === 'ro' ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl text-xs font-semibold leading-normal flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>The Regional Overseer account has read-only permission for campaigns dispatch. Bulletins must be issued by a registered Church Admin or Developer.</span>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={loading || activeSubscribers.length === 0}
                  id="campaign-submit-btn"
                  className="w-full bg-deep-navy text-royal-gold hover:text-white font-bold uppercase tracking-wider text-xs py-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending Campaign...' : `Dispatch Bulletin to ${activeSubscribers.length} Members`}</span>
                </button>
              )}
            </form>
          </div>
        )}

        {activeSubTab === 'history' && (
          <div className="space-y-4" id="dispatched-campaigns-timeline">
            {campaigns.length > 0 ? (
              campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3"
                  id={`campaign-history-${camp.id}`}
                >
                  <div className="flex items-start justify-between border-b border-gray-50 pb-2 gap-4">
                    <div>
                      <h5 className="font-serif font-bold text-deep-navy text-sm sm:text-base leading-snug">{camp.subject}</h5>
                      <span className="text-[10px] text-gray-400 font-mono">Dispatched on: {camp.sent_at}</span>
                    </div>
                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[9px] uppercase px-2 py-0.5 rounded leading-none font-extrabold shrink-0">
                      📬 Sent to {camp.recipients_count} active addresses
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium whitespace-pre-line leading-relaxed font-sans max-h-40 overflow-y-auto bg-gray-50 p-4 rounded-xl border border-gray-100/50">
                    {camp.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400 space-y-3 shadow-sm">
                <History className="w-12 h-12 mx-auto text-gray-300 shrink-0" />
                <h5 className="font-serif text-sm font-semibold">No Sent Campaigns</h5>
                <p className="text-xs">Sent weekly announcements and bulletins will appear in this history timeline log.</p>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'archives' && (
          <div className="space-y-8" id="newsletter-archives-admin-section">
            
            {/* Split Grid: Left Form, Right List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Form Col */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-sm p-6" id="upload-archive-pdf-form">
                <div className="flex items-center space-x-3 border-b border-gray-150 pb-4 mb-6">
                  <UploadCloud className="w-5 h-5 text-royal-gold shrink-0" />
                  <div>
                    <h4 className="text-base font-serif font-bold text-deep-navy">Upload Newsletter PDF</h4>
                    <p className="text-[10px] text-gray-400 font-mono uppercase">Add printable bulletins to public media archive</p>
                  </div>
                </div>

                {pdfSuccess && (
                  <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start space-x-3 text-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-sans leading-normal font-semibold">{pdfSuccess}</span>
                  </div>
                )}
                {pdfError && (
                  <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-semibold">
                    {pdfError}
                  </div>
                )}

                <form onSubmit={handleUploadPdf} className="space-y-4" id="pdf-upload-form">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Bulletin Title *</label>
                    <input
                      type="text"
                      required
                      value={pdfTitle}
                      onChange={(e) => setPdfTitle(e.target.value)}
                      placeholder="e.g. Weekly Bulletin - June 21, 2026"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Publish Date *</label>
                      <input
                        type="date"
                        required
                        value={pdfPublishDate}
                        onChange={(e) => setPdfPublishDate(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Short Description / Subtitle</label>
                    <textarea
                      rows={3}
                      value={pdfDescription}
                      onChange={(e) => setPdfDescription(e.target.value)}
                      placeholder="e.g. Holiness, spiritual growth, and announcements..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold text-gray-800 resize-none"
                    />
                  </div>

                  {/* Drag and Drop Zone */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">PDF Document *</label>
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('bulletin-pdf-file-input')?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                        isDragActive 
                          ? 'border-royal-gold bg-royal-gold/5' 
                          : pdfFile 
                            ? 'border-emerald-300 bg-emerald-50/10' 
                            : 'border-gray-200 hover:border-royal-gold/40'
                      }`}
                    >
                      <input
                        id="bulletin-pdf-file-input"
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setPdfFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      <UploadCloud className={`w-8 h-8 mx-auto mb-2 ${pdfFile ? 'text-emerald-500' : 'text-gray-400'}`} />
                      {pdfFile ? (
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-emerald-700 truncate">{pdfFile.name}</p>
                          <p className="text-[10px] font-mono text-gray-400">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-600">Drag & drop your PDF file here</p>
                          <p className="text-[10px] text-gray-400">or click to browse local files</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {userRole === 'ro' ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl text-xs font-semibold leading-normal flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>The Regional Overseer account has read-only permission. PDF uploads must be performed by a Church Admin or Developer.</span>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={uploadingPdf || !pdfFile}
                      id="pdf-upload-submit-btn"
                      className="w-full bg-deep-navy text-royal-gold hover:text-white font-bold uppercase tracking-wider text-xs py-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span>{uploadingPdf ? 'Uploading PDF Document...' : 'Publish PDF to Archive'}</span>
                    </button>
                  )}
                </form>
              </div>

              {/* List Col */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" id="newsletter-pdfs-list">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-deep-navy shrink-0" />
                    <span className="font-serif font-bold text-deep-navy text-sm">Archived PDF Documents</span>
                  </div>
                  <span className="text-[10px] bg-gray-50 border border-gray-100 px-2 py-0.5 rounded text-gray-500 font-mono font-bold uppercase">
                    {pdfs.length} files
                  </span>
                </div>

                {pdfs.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {pdfs.map((pdf) => (
                      <div key={pdf.id} className="p-6 flex items-start justify-between gap-4 hover:bg-gray-50/30 transition-all">
                        <div className="flex items-start space-x-3 min-w-0">
                          <div className="w-10 h-10 bg-deep-navy/5 text-deep-navy border border-deep-navy/10 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] font-mono font-bold text-royal-gold block mb-0.5">
                              {pdf.publish_date}
                            </span>
                            <h5 className="font-serif font-bold text-deep-navy text-sm leading-snug truncate">
                              {pdf.title}
                            </h5>
                            {pdf.description && (
                              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mt-0.5">
                                {pdf.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <a
                            href={pdf.pdf_url}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-gray-500 hover:text-deep-navy hover:bg-gray-50 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <FileDown className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDeletePdf(pdf.id)}
                            disabled={userRole === 'ro'}
                            className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete File"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-16 text-center text-gray-400 space-y-3">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 shrink-0" />
                    <h5 className="font-serif text-sm font-semibold">No PDF Bulletins Archived</h5>
                    <p className="text-xs">You can upload past weekly newsletters or print bulletins to make them available for download.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </DashboardShell>
  );
}
