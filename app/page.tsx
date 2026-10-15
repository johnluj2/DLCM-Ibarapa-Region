'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Calendar, MapPin, ExternalLink, ArrowRight, Video, ChevronRight, MessageSquare, Quote, Radio, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import ScrollFade from '@/components/ScrollFade';
import { getUpcomingServices, getNextService, formatServiceDate, ServiceInfo } from '@/lib/schedule';

interface Program {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  poster_url: string;
  status: string;
}

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

interface Broadcast {
  stream_url: string;
  is_live: boolean;
}

interface Testimony {
  id: string;
  full_name: string;
  message: string;
}

export default function HomePage() {
  const [broadcast, setBroadcast] = useState<Broadcast>({
    stream_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    is_live: false,
  });
  const [programs, setPrograms] = useState<Program[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [testimony, setTestimony] = useState<Testimony | null>(null);
  const [nextService, setNextServiceState] = useState<ServiceInfo | null>(() => getNextService());
  const [allUpcoming, setAllUpcoming] = useState<ServiceInfo[]>(() => getUpcomingServices());

  const broadcastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch live broadcast settings
    fetch('/api/broadcast')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.broadcast) {
          setBroadcast(data.broadcast);
        }
      })
      .catch((err) => console.error('Error fetching broadcast:', err));

    // 2. Fetch programs
    fetch('/api/programs')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.programs) {
          // Show published ones, sorted by date
          const published = data.programs
            .filter((p: Program) => p.status === 'published')
            .sort((a: Program, b: Program) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
          setPrograms(published);
        }
      })
      .catch((err) => console.error('Error fetching programs:', err));

    // 3. Fetch highlights
    fetch('/api/highlights')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.highlights) {
          setHighlights(data.highlights.slice(0, 3)); // Latest 3
        }
      })
      .catch((err) => console.error('Error fetching highlights:', err));

    // 4. Fetch testimony
    fetch('/api/submissions')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.submissions) {
          const approvedTestimonies = data.submissions.filter(
            (s: any) => s.type === 'testimony' && s.status === 'approved'
          );
          if (approvedTestimonies.length > 0) {
            // Get latest or random
            setTestimony(approvedTestimonies[0]);
          }
        }
      })
      .catch((err) => console.error('Error fetching testimonies:', err));
  }, []);

  const scrollToBroadcast = () => {
    broadcastRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen" id="home-page-root">
      <PublicHeader />

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen bg-deep-navy flex items-center justify-center overflow-hidden pt-16">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://picsum.photos/seed/dlcmibarapa/1920/1080"
            alt="Deeper Christian Life Ministry Worship"
            fill
            priority
            className="object-cover opacity-20 blur-[2px]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep-navy via-deep-navy/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-12 pb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-royal-gold/15 border border-royal-gold/35 px-4 py-2 rounded-full mb-8 text-royal-gold text-xs font-mono uppercase tracking-widest"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-royal-gold" />
            <span>Deeper Christian Life Ministry</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-6xl md:text-7xl font-serif font-extrabold text-white leading-tight tracking-tight mb-6"
          >
            Ibarapa Region
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-2xl text-gray-300 font-sans italic max-w-2xl mx-auto mb-10"
          >
            {"\"Rooted in the Word. Alive in the Spirit.\""}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={scrollToBroadcast}
              id="hero-watch-live-btn"
              className="w-full sm:w-auto bg-royal-gold text-deep-navy hover:bg-white hover:text-deep-navy font-bold uppercase tracking-wider text-xs px-8 py-4 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center space-x-3 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Watch Live Stream</span>
            </button>
            <Link
              href="/connect"
              id="hero-join-community-btn"
              className="w-full sm:w-auto bg-transparent text-white hover:text-royal-gold hover:bg-white/5 border border-white/30 hover:border-royal-gold font-bold uppercase tracking-wider text-xs px-8 py-4 rounded-full transition-all duration-200 flex items-center justify-center space-x-3"
            >
              <span>Join Our Community</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Ambient Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-spirit-white to-transparent" />
      </section>

      {/* Live Broadcast Section */}
      <section ref={broadcastRef} id="broadcast-section" className="bg-spirit-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <ScrollFade direction="up" className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-deep-navy">
              Worship With Us Online
            </h3>
            <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
              Distance is never a barrier. Join our live spiritual broadcasts directly from your home.
            </p>
          </ScrollFade>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Player block (col-span-8) */}
            <ScrollFade direction="left" distance={36} className="lg:col-span-8 bg-black rounded-2xl shadow-2xl overflow-hidden border border-royal-gold/10 aspect-video relative">
              {broadcast.is_live ? (
                <iframe
                  src={broadcast.stream_url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  id="live-broadcast-iframe"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-deep-navy p-6 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                    <Radio className="w-8 h-8 text-royal-gold/60" />
                  </div>
                  <h4 className="text-white font-serif text-lg font-semibold mb-2">
                    Broadcast is Currently Offline
                  </h4>
                  {nextService ? (
                    <div className="bg-royal-gold/10 border border-royal-gold/20 px-5 py-3 rounded-xl mt-2 max-w-sm">
                      <p className="text-royal-gold font-mono text-[10px] uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 animate-bounce" /> Next Broadcast
                      </p>
                      <p className="text-white text-sm font-semibold">{nextService.name}</p>
                      <p className="text-gray-300 text-xs mt-1">
                        {formatServiceDate(nextService.computedDate)} at {nextService.time}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-xs">Stay tuned for upcoming services.</p>
                  )}
                </div>
              )}

              {/* Live Tag overlay */}
              {broadcast.is_live && (
                <div className="absolute top-4 left-4 bg-ember-red text-white font-bold font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-lg animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white block" />
                  <span>LIVE NOW</span>
                </div>
              )}
            </ScrollFade>

            {/* Sidebar info block (col-span-4) */}
            <ScrollFade direction="right" distance={36} delay={0.15} className="lg:col-span-4 bg-deep-navy text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-royal-gold/10 flex flex-col h-full justify-between">
              <div>
                <span className="text-royal-gold font-mono text-[10px] uppercase tracking-widest block mb-2">
                  Live Stream Hub
                </span>
                <h4 className="text-2xl font-serif font-bold mb-4 text-white">
                  {broadcast.is_live ? 'We are Live!' : 'Sustained Vigilance'}
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  {broadcast.is_live
                    ? 'Participate actively, sing along with the choir, open your Bible, and open your heart to receive a profound blessing from the Lord.'
                    : 'When we are offline, you can listen to past recorded sermons, read testimonies of God\'s miraculous deeds in our region, or prepare your heart for the next scheduled service.'}
                </p>
              </div>

              <div className="border-t border-white/10 pt-6 space-y-4">
                <Link
                  href="/media"
                  className="text-royal-gold hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-between group"
                >
                  <span>Explore past sermons</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/connect"
                  className="text-gray-300 hover:text-royal-gold text-xs font-bold uppercase tracking-wider flex items-center justify-between group"
                >
                  <span>Submit counseling request</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </ScrollFade>
          </div>
        </div>
      </section>

      {/* Service Schedule Section */}
      <section id="schedule-section" className="bg-gradient-to-b from-[#EFECE1] to-spirit-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <ScrollFade direction="up" className="text-center mb-16">
            <span className="text-royal-gold font-mono text-[10px] uppercase tracking-widest block mb-2">
              Source of Truth
            </span>
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-deep-navy">
              Weekly Service Schedule
            </h3>
            <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
              Join us at our headquarters for a physical encounter with the Word and power of God.
            </p>
          </ScrollFade>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allUpcoming.map((svc, idx) => (
              <ScrollFade
                key={svc.name}
                direction="up"
                delay={idx * 0.1}
                className={`bg-white rounded-2xl p-6 shadow-md border hover:shadow-lg hover:border-royal-gold/30 transition-all duration-300 flex flex-col justify-between ${
                  svc.name === 'Power Night'
                    ? 'border-royal-gold ring-1 ring-royal-gold/20 relative overflow-hidden'
                    : 'border-gray-100'
                }`}
              >
                {svc.name === 'Power Night' && (
                  <div className="absolute top-0 right-0 bg-royal-gold text-deep-navy font-bold font-mono text-[9px] uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-sm">
                    Monthly Special
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-serif font-bold text-deep-navy mb-1">
                    {svc.name}
                  </h4>
                  <div className="flex flex-col text-xs font-mono text-royal-gold mb-4">
                    <span>{svc.day}</span>
                    <span className="text-deep-navy/70 font-semibold">{svc.time}</span>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed mb-6">
                    {svc.tagline}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-4 flex flex-col space-y-1">
                  <span className="text-[10px] font-mono text-gray-400">NEXT OCCURRENCE</span>
                  <span className="text-xs font-bold text-deep-navy">
                    {svc.name === 'Power Night'
                      ? formatServiceDate(svc.computedDate)
                      : formatServiceDate(svc.computedDate).split(',').slice(0, 2).join(',')}
                  </span>
                </div>
              </ScrollFade>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Programs Banner (Admin posted) */}
      {programs.length > 0 && (
        <section id="programs-section" className="bg-deep-navy text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Subtle decoration lines */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-royal-gold/5 rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-royal-gold/5 rounded-full filter blur-3xl" />

          <div className="max-w-6xl mx-auto relative z-10">
            <ScrollFade direction="up" className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-royal-gold font-mono text-[10px] uppercase tracking-widest block mb-2">
                  Special Gatherings
                </span>
                <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white">
                  Upcoming Regional Programs
                </h3>
              </div>
              <Link
                href="/connect"
                className="text-royal-gold hover:text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 group shrink-0"
              >
                <span>View info & submit inquiries</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </ScrollFade>

            {/* Program cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {programs.slice(0, 2).map((prog, idx) => (
                <ScrollFade
                  key={prog.id}
                  direction="up"
                  delay={idx * 0.15}
                  className="bg-white/5 rounded-2xl border border-white/10 hover:border-royal-gold/40 transition-all duration-300 overflow-hidden grid grid-cols-1 sm:grid-cols-12"
                >
                  <div className="sm:col-span-5 relative min-h-[160px] sm:min-h-full bg-white/5">
                    <Image
                      src={prog.poster_url}
                      alt={prog.title}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="sm:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-2 bg-royal-gold/10 border border-royal-gold/20 px-3 py-1 rounded-full w-fit mb-4">
                        <Calendar className="w-3.5 h-3.5 text-royal-gold" />
                        <span className="text-royal-gold font-mono text-[9px] uppercase tracking-wider">
                          {prog.event_date} · {prog.event_time}
                        </span>
                      </div>
                      <h4 className="text-xl font-serif font-bold text-white mb-2 leading-snug">
                        {prog.title}
                      </h4>
                      <p className="text-gray-300 text-xs leading-relaxed line-clamp-3">
                        {prog.description}
                      </p>
                    </div>

                    <div className="mt-6 border-t border-white/5 pt-4">
                      <Link
                        href="/connect"
                        className="text-royal-gold hover:text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 group"
                      >
                        <span>Request Visitation or Counseling</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </ScrollFade>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Highlights Reel */}
      {highlights.length > 0 && (
        <section id="highlights-section" className="bg-spirit-white py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <ScrollFade direction="up" className="text-center mb-16">
              <span className="text-royal-gold font-mono text-[10px] uppercase tracking-widest block mb-2">
                Recent Highlights
              </span>
              <h3 className="text-3xl sm:text-4xl font-serif font-bold text-deep-navy">
                Highlights of Past Programs
              </h3>
              <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
                Feed your spirit with message extracts, photo portfolios, and testimony reports from past meetings.
              </p>
            </ScrollFade>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {highlights.map((high, idx) => (
                <ScrollFade
                  key={high.id}
                  direction="up"
                  delay={idx * 0.12}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-lg hover:border-royal-gold/20 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Primary Image preview */}
                    <div className="relative aspect-video bg-gray-50">
                      {high.photo_urls && high.photo_urls.length > 0 ? (
                        <Image
                          src={high.photo_urls[0]}
                          alt={high.sermon_title || high.program_name}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-deep-navy/10 flex items-center justify-center">
                          <Radio className="w-8 h-8 text-royal-gold/40" />
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 bg-deep-navy text-royal-gold font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow">
                        {high.service_type.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="p-6">
                      <span className="text-gray-400 font-mono text-[10px] block mb-1">
                        {high.program_date}
                      </span>
                      <h4 className="text-lg font-serif font-bold text-deep-navy mb-2 line-clamp-1">
                        {high.sermon_title || high.program_name}
                      </h4>
                      <p className="text-gray-600 text-xs leading-relaxed line-clamp-3 mb-4">
                        {high.description}
                      </p>
                      {high.preacher_name && (
                        <p className="text-deep-navy font-bold text-xs">
                          Preacher: <span className="text-royal-gold">{high.preacher_name}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <Link
                      href="/media"
                      className="text-royal-gold hover:text-deep-navy text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Listen / View Portfolio</span>
                    </Link>
                  </div>
                </ScrollFade>
              ))}
            </div>

            <ScrollFade direction="up" delay={0.2} className="text-center">
              <Link
                href="/media"
                id="highlights-see-all-media-btn"
                className="inline-flex items-center space-x-3 bg-deep-navy text-white hover:bg-royal-gold hover:text-deep-navy font-bold uppercase tracking-wider text-xs px-8 py-4 rounded-full shadow transition-all duration-200"
              >
                <span>See All Media & Sermons</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </ScrollFade>
          </div>
        </section>
      )}

      {/* Testimony Snippet */}
      {testimony && (
        <section id="testimony-snippet-section" className="bg-gradient-to-b from-spirit-white to-[#EFECE1] py-24 px-4 sm:px-6 lg:px-8 relative">
          <ScrollFade direction="up" distance={30} className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-royal-gold/15 relative overflow-hidden">
            {/* Background Quotes decoration */}
            <Quote className="absolute -top-6 -left-6 w-36 h-36 text-royal-gold/5 shrink-0 transform -rotate-12" />

            <div className="relative z-10 text-center">
              <div className="w-12 h-12 bg-royal-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-5 h-5 text-royal-gold" />
              </div>
              <span className="text-royal-gold font-mono text-[10px] uppercase tracking-widest block mb-4">
                Featured Testimony
              </span>

              <p className="text-lg sm:text-xl font-serif text-deep-navy italic leading-relaxed max-w-2xl mx-auto mb-8">
                {"\"" + testimony.message + "\""}
              </p>

              <h4 className="text-sm font-sans font-bold text-deep-navy">
                — {testimony.full_name}
              </h4>

              <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-4">
                <span className="text-xs text-gray-500 font-sans">
                  Have you experienced the wonders of God in our services?
                </span>
                <Link
                  href="/connect#testimony"
                  id="testimony-share-yours-btn"
                  className="bg-royal-gold text-deep-navy hover:bg-deep-navy hover:text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200"
                >
                  Share Your Testimony
                </Link>
              </div>
            </div>
          </ScrollFade>
        </section>
      )}

      <PublicFooter />
    </div>
  );
}
