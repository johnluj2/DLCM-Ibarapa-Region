'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Search, Play, Pause, Download, Video, Calendar, Filter, ArrowUpDown, ChevronDown, Radio, Eye, X, ChevronLeft, ChevronRight, FileText, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import ScrollFade from '@/components/ScrollFade';

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

interface NewsletterPdf {
  id: string;
  title: string;
  pdf_url: string;
  publish_date: string;
  description?: string;
  created_at: string;
}

export default function MediaPage() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [newsletters, setNewsletters] = useState<NewsletterPdf[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('latest');
  const [newsletterSort, setNewsletterSort] = useState<'desc' | 'asc'>('desc');

  // Audio player state
  const [currentSermon, setCurrentSermon] = useState<Highlight | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Lightbox state
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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

  const fetchNewsletters = () => {
    fetch('/api/newsletters')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.newsletters) {
          setNewsletters(data.newsletters);
        }
      })
      .catch((err) => console.error('Error fetching newsletters:', err));
  };

  useEffect(() => {
    fetchHighlights();
    fetchNewsletters();
  }, []);

  const handlePlayPause = (sermon: Highlight) => {
    if (!sermon.audio_url) return;

    if (currentSermon?.id === sermon.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      // Load new sermon
      setCurrentSermon(sermon);
      setIsPlaying(true);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.src = sermon.audio_url;
        audioRef.current.load();
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handleDownload = async (sermon: Highlight) => {
    if (!sermon.audio_url) return;

    try {
      // Trigger passive server-side download count increment
      const patchRes = await fetch(`/api/highlights?id=${sermon.id}&action=download`, {
        method: 'PATCH',
      });
      if (patchRes.ok) {
        // Increment locally for instant UI response
        setHighlights((prev) =>
          prev.map((h) => (h.id === sermon.id ? { ...h, download_count: h.download_count + 1 } : h))
        );
      }

      // Initiate browser download
      const link = document.createElement('a');
      link.href = sermon.audio_url;
      link.setAttribute('download', `${sermon.sermon_title || 'Sermon'}.mp3`);
      link.setAttribute('target', '_blank'); // fallback
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error recording download:', error);
    }
  };

  // Audio elements updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentSermon]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Filter & Sort Logic
  const filteredSermons = highlights
    .filter((h) => {
      const query = search.toLowerCase();
      const matchesSearch =
        h.sermon_title.toLowerCase().includes(query) ||
        h.preacher_name.toLowerCase().includes(query) ||
        h.program_name.toLowerCase().includes(query) ||
        h.description.toLowerCase().includes(query);

      const matchesFilter = filterType === 'all' || h.service_type === filterType;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.program_date).getTime() - new Date(a.program_date).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.program_date).getTime() - new Date(b.program_date).getTime();
      }
      if (sortBy === 'downloaded') {
        return b.download_count - a.download_count;
      }
      return 0;
    });

  // Photo gallery compilation (any photo uploaded in highlights table)
  const allPhotos = highlights.reduce<{ url: string; program: string; date: string }[]>((acc, curr) => {
    if (curr.photo_urls && curr.photo_urls.length > 0) {
      curr.photo_urls.forEach((p) => {
        acc.push({ url: p, program: curr.program_name, date: curr.program_date });
      });
    }
    return acc;
  }, []);

  // Video highlights compilation
  const allVideos = highlights.filter((h) => h.video_url);

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  return (
    <div className="flex flex-col min-h-screen pb-24" id="media-page-root">
      <PublicHeader />

      {/* Hidden audio tag */}
      <audio ref={audioRef} preload="auto" />

      {/* Hero Section */}
      <section className="relative bg-deep-navy pt-40 pb-20 text-white overflow-hidden text-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://picsum.photos/seed/sermons/1920/1080"
            alt="Worship Word"
            fill
            className="object-cover opacity-15"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-deep-navy/95 via-deep-navy to-spirit-white" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-royal-gold font-mono text-[10px] uppercase tracking-widest block mb-3">
            Spiritual Resources
          </span>
          <h2 className="text-4xl sm:text-5xl font-serif font-extrabold leading-tight tracking-tight">
            Encounter God Through His Word
          </h2>
          <p className="text-gray-300 text-xs sm:text-sm max-w-lg mx-auto mt-4 leading-relaxed">
            Search our comprehensive sermon catalog, download spiritual audio, or scroll through visual highlights of our past encounters.
          </p>

          {/* Large Search Bar */}
          <div className="mt-8 max-w-xl mx-auto relative" id="media-search-container">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search sermons, preachers, special programs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white text-gray-800 pl-12 pr-4 py-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-royal-gold border border-gray-100 text-sm"
              id="media-search-input"
            />
          </div>
        </div>
      </section>

      {/* Filter and Sort bar */}
      <section className="bg-white border-b border-gray-100 py-6 px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Categories */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none" id="filter-bar">
            <Filter className="w-4 h-4 text-gray-400 shrink-0 mr-1" />
            {[
              { id: 'all', label: 'All Sermons' },
              { id: 'sunday', label: 'Sunday Service' },
              { id: 'bible_study', label: 'Bible Study' },
              { id: 'revival', label: 'Revival Hour' },
              { id: 'power_night', label: 'Power Night' },
              { id: 'special', label: 'Special' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterType(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors duration-150 ${
                  filterType === cat.id
                    ? 'bg-royal-gold text-deep-navy shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
                id={`filter-btn-${cat.id}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort selection */}
          <div className="flex items-center space-x-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-lg text-xs font-semibold text-gray-700 py-2 px-3 focus:outline-none focus:ring-1 focus:ring-royal-gold"
              id="media-sort-select"
            >
              <option value="latest">Latest Released</option>
              <option value="oldest">Oldest Released</option>
              <option value="downloaded">Most Downloaded</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main content grid */}
      <section className="bg-spirit-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Audio Sermons Library */}
          <div id="audio-sermons-section">
            <ScrollFade direction="up" className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-royal-gold/15 rounded-lg flex items-center justify-center border border-royal-gold/25">
                <Radio className="w-5 h-5 text-royal-gold" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-deep-navy">Sermon Audio Library</h3>
                <p className="text-xs text-gray-500">Listen or download audio teachings from Ibarapa Region.</p>
              </div>
            </ScrollFade>

            {filteredSermons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSermons.map((s, idx) => {
                  const isCurrent = currentSermon?.id === s.id;
                  const showPlaying = isCurrent && isPlaying;
                  return (
                    <ScrollFade
                      key={s.id}
                      direction="up"
                      delay={idx * 0.05}
                      className={`bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-between transition-all duration-300 ${
                        isCurrent
                          ? 'border-royal-gold ring-1 ring-royal-gold/20'
                          : 'border-gray-100 hover:shadow-md hover:border-royal-gold/10'
                      }`}
                    >
                      <div>
                        {/* Title & metadata */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-mono text-royal-gold bg-royal-gold/10 px-2 py-1 rounded-md uppercase tracking-wider font-semibold">
                            {s.service_type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">
                            {s.program_date}
                          </span>
                        </div>

                        <h4 className="text-base sm:text-lg font-serif font-bold text-deep-navy mb-1 leading-snug line-clamp-1">
                          {s.sermon_title || 'Encounter service message'}
                        </h4>
                        <p className="text-xs text-royal-gold font-bold mb-3">{s.preacher_name || 'Regional Overseer'}</p>
                        <p className="text-xs text-gray-500 leading-relaxed mb-6 line-clamp-3">
                          {s.description}
                        </p>
                      </div>

                      {/* Controls Row */}
                      <div className="border-t border-gray-50 pt-4 flex items-center justify-between gap-2">
                        <div className="flex items-center text-[11px] font-mono text-gray-400">
                          <Download className="w-3.5 h-3.5 mr-1 text-gray-400 shrink-0" />
                          <span>{s.download_count} downloads</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {s.audio_url && (
                            <button
                              onClick={() => handlePlayPause(s)}
                              id={`sermon-play-btn-${s.id}`}
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                showPlaying
                                  ? 'bg-royal-gold text-deep-navy shadow-sm'
                                  : 'bg-deep-navy text-white hover:bg-royal-gold hover:text-deep-navy'
                              }`}
                            >
                              {showPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </button>
                          )}
                          {s.audio_url && s.allow_download && (
                            <button
                              onClick={() => handleDownload(s)}
                              id={`sermon-download-btn-${s.id}`}
                              className="w-9 h-9 bg-gray-50 text-gray-600 hover:bg-royal-gold/15 hover:text-royal-gold rounded-full flex items-center justify-center transition-colors"
                              title="Download mp3"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </ScrollFade>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center text-gray-400">
                No sermons match your criteria. Try resetting the search or filter query.
              </div>
            )}
          </div>

          {/* Video Highlights */}
          {allVideos.length > 0 && (
            <div id="video-highlights-section">
              <ScrollFade direction="up" className="flex items-center space-x-3 mb-8 border-t border-gray-100 pt-16">
                <div className="w-10 h-10 bg-royal-gold/15 rounded-lg flex items-center justify-center border border-royal-gold/25">
                  <Video className="w-5 h-5 text-royal-gold" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-deep-navy">Program Video Highlights</h3>
                  <p className="text-xs text-gray-500">Watch powerful summary reels and preachings from past special programs.</p>
                </div>
              </ScrollFade>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {allVideos.map((v, idx) => (
                  <ScrollFade key={v.id} direction="up" delay={idx * 0.1} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md">
                    <div className="aspect-video bg-black">
                      <iframe
                        src={v.video_url}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-[10px] font-mono text-royal-gold bg-royal-gold/10 px-2 py-0.5 rounded uppercase">
                          {v.service_type}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">{v.program_date}</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-serif font-bold text-deep-navy leading-snug">
                        {v.sermon_title || v.program_name}
                      </h4>
                      <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                        {v.description}
                      </p>
                    </div>
                  </ScrollFade>
                ))}
              </div>
            </div>
          )}

          {/* Newsletter Archive Section */}
          <div id="newsletter-archive-section">
            <ScrollFade direction="up" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-t border-gray-100 pt-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-royal-gold/15 rounded-lg flex items-center justify-center border border-royal-gold/25">
                  <FileText className="w-5 h-5 text-royal-gold" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-deep-navy">Newsletter Archive</h3>
                  <p className="text-xs text-gray-500">Download and read our weekly bulletins, teachings, and community announcements.</p>
                </div>
              </div>
              
              {/* Sort selector for newsletters */}
              <div className="flex items-center space-x-2 shrink-0 self-start sm:self-center">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 font-medium">Sort Bulletins:</span>
                <select
                  value={newsletterSort}
                  onChange={(e) => setNewsletterSort(e.target.value as 'desc' | 'asc')}
                  className="bg-white border border-gray-150 rounded-lg text-xs font-semibold text-gray-700 py-1.5 px-2.5 focus:outline-none focus:ring-1 focus:ring-royal-gold"
                  id="newsletter-sort-select"
                >
                  <option value="desc">Latest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </ScrollFade>

            {newsletters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="newsletters-archive-grid">
                {[...newsletters]
                  .sort((a, b) => {
                    if (newsletterSort === 'desc') {
                      return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime();
                    } else {
                      return new Date(a.publish_date).getTime() - new Date(b.publish_date).getTime();
                    }
                  })
                  .map((news, idx) => (
                    <ScrollFade
                      key={news.id}
                      direction="up"
                      delay={idx * 0.08}
                      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                      id={`newsletter-card-${news.id}`}
                    >
                      <div className="flex items-start space-x-4 min-w-0">
                        <div className="w-12 h-12 bg-deep-navy text-royal-gold rounded-xl flex items-center justify-center shrink-0 border border-royal-gold/10 group-hover:scale-105 transition-transform">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono font-bold text-royal-gold bg-royal-gold/10 px-2 py-0.5 rounded uppercase block w-fit mb-1">
                            {news.publish_date}
                          </span>
                          <h4 className="text-base font-serif font-bold text-deep-navy group-hover:text-royal-gold transition-colors truncate">
                            {news.title}
                          </h4>
                          {news.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                              {news.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <a
                        href={news.pdf_url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto px-4 py-2.5 bg-gray-50 hover:bg-royal-gold text-gray-700 hover:text-deep-navy font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 transition-all shadow-sm shrink-0 cursor-pointer"
                        id={`download-pdf-btn-${news.id}`}
                        title="Download PDF"
                      >
                        <FileDown className="w-4 h-4" />
                        <span className="sm:hidden">Download Bulletin</span>
                      </a>
                    </ScrollFade>
                  ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center text-gray-400">
                No archived newsletter bulletins are currently available.
              </div>
            )}
          </div>

          {/* Masonry Photo Gallery */}
          {allPhotos.length > 0 && (
            <div id="photo-gallery-section">
              <ScrollFade direction="up" className="flex items-center space-x-3 mb-8 border-t border-gray-100 pt-16">
                <div className="w-10 h-10 bg-royal-gold/15 rounded-lg flex items-center justify-center border border-royal-gold/25">
                  <Eye className="w-5 h-5 text-royal-gold" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-deep-navy">Worship Experience Gallery</h3>
                  <p className="text-xs text-gray-500">Glance through visual records of holy assembly across Ibarapa.</p>
                </div>
              </ScrollFade>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {allPhotos.map((p, index) => (
                  <ScrollFade
                    key={index}
                    direction="up"
                    delay={(index % 8) * 0.04}
                    onClick={() => openLightbox(allPhotos.map((img) => img.url), index)}
                    className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer border border-gray-100 shadow-sm"
                  >
                    <Image
                      src={p.url}
                      alt={p.program}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-deep-navy/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
                      <h5 className="text-white text-xs font-bold leading-tight line-clamp-1">{p.program}</h5>
                      <span className="text-[9px] font-mono text-royal-gold mt-1 block">{p.date}</span>
                    </div>
                  </ScrollFade>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Persistent Audio Player Bar */}
      <AnimatePresence>
        {currentSermon && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            id="persistent-audio-player"
            className="fixed bottom-0 left-0 right-0 z-40 bg-deep-navy border-t border-royal-gold/20 shadow-2xl px-4 py-4 sm:px-6"
          >
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left Side: Sermon info */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentSermon(null)}
                  className="p-1 rounded-md text-gray-400 hover:text-white shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-10 h-10 bg-royal-gold/10 rounded flex items-center justify-center border border-royal-gold/20 shrink-0">
                  <Radio className="w-5 h-5 text-royal-gold shrink-0" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-white font-serif font-semibold text-xs sm:text-sm truncate">
                    {currentSermon.sermon_title || 'Sunday service message'}
                  </h4>
                  <p className="text-[10px] text-royal-gold font-bold truncate">
                    {currentSermon.preacher_name || 'Pastor Oyegoke'}
                  </p>
                </div>
              </div>

              {/* Center Side: Scrub slider */}
              <div className="flex-1 flex items-center space-x-3 max-w-xl mx-auto w-full">
                <span className="text-[10px] font-mono text-gray-400 shrink-0 w-8 text-right">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-royal-gold focus:outline-none"
                />
                <span className="text-[10px] font-mono text-gray-400 shrink-0 w-8">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Right Side: Player Action */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => handlePlayPause(currentSermon)}
                  id="persistent-player-toggle"
                  className="w-10 h-10 bg-royal-gold text-deep-navy rounded-full flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                {currentSermon.allow_download && (
                  <button
                    onClick={() => handleDownload(currentSermon)}
                    id="persistent-player-download"
                    className="w-10 h-10 bg-white/5 border border-white/10 text-white rounded-full flex items-center justify-center shrink-0 hover:bg-white/10"
                    title="Download Mp3"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 select-none"
            id="lightbox-backdrop"
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white hover:bg-white/15 focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev */}
            {lightboxIndex > 0 && (
              <button
                onClick={() => setLightboxIndex(lightboxIndex - 1)}
                className="absolute left-6 p-3 rounded-full bg-white/5 text-white hover:bg-white/15 focus:outline-none"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Slide */}
            <div className="relative max-w-4xl max-h-[80vh] w-full h-full">
              <Image
                src={lightboxImages[lightboxIndex]}
                alt="Enlarged gallery encounter"
                fill
                className="object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Next */}
            {lightboxIndex < lightboxImages.length - 1 && (
              <button
                onClick={() => setLightboxIndex(lightboxIndex + 1)}
                className="absolute right-6 p-3 rounded-full bg-white/5 text-white hover:bg-white/15 focus:outline-none"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <PublicFooter />
    </div>
  );
}
