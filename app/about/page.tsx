'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp, BookOpen, ShieldCheck, Award, Heart, HelpCircle, Flame, Star, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import ScrollFade from '@/components/ScrollFade';

interface RoProfile {
  full_name: string;
  photo_url: string;
  role: string;
  bio: string;
}

export default function AboutPage() {
  const [ro, setRo] = useState<RoProfile | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    fetch('/api/profiles/ro')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setRo(data);
      })
      .catch((err) => console.error('Error fetching RO:', err));
  }, []);

  const beliefs = [
    {
      title: 'The Bible as the Inerrant Word of God',
      content: 'We believe that the Holy Bible, consisting of 66 books of the Old and New Testaments, is the fully inspired Word of God. It is the absolute, infallible, and sole authority for faith and practice, containing everything necessary for salvation.',
    },
    {
      title: 'The Trinity',
      content: 'We believe in the one true and living God, eternally co-existing in three distinct Persons: God the Father, God the Son, and God the Holy Spirit. Each is fully God, equal in power, majesty, and glory.',
    },
    {
      title: 'Salvation by Grace Through Faith',
      content: 'We believe that salvation is a free gift of God, received entirely by grace through repentance from sin and faith in the finished work of our Lord Jesus Christ on the cross. It is not of works, lest any man should boast.',
    },
    {
      title: 'The Baptism of the Holy Spirit',
      content: 'We believe in the baptism of the Holy Spirit, subsequent to salvation, with the initial physical evidence of speaking in other tongues as the Spirit gives utterance. It empowers believers for holy living, effective evangelism, and supernatural service.',
    },
    {
      title: 'The Second Coming of Christ',
      content: 'We believe in the personal, premillennial, and imminent return of Jesus Christ to rapture the living and sleeping saints, followed by His thousand-year reign on earth in absolute peace and righteousness.',
    },
    {
      title: 'Holiness of Life',
      content: 'We believe that sanctification and holiness are necessary commands for every believer. Without holiness, no man shall see the Lord. We are called to live soberly, righteously, and godly in this present world, separated from all sinful worldliness.',
    },
  ];

  const values = [
    { name: 'Faith', desc: 'Absolute dependence on the unchangeable promises of God.', icon: Heart },
    { name: 'Prayer', desc: 'The spiritual life-force that breaks chains and unlocks heavens.', icon: Flame },
    { name: 'The Word', desc: 'The solid foundation of all truth and doctrine.', icon: BookOpen },
    { name: 'Holiness', desc: 'A dedicated life of pure thoughts, words, and actions.', icon: ShieldCheck },
    { name: 'Evangelism', desc: 'Taking the raw Gospel of Christ to every soul in Ibarapa and beyond.', icon: Star },
  ];

  const branches = [
    { name: 'Igboora Region Headquarters', address: 'Bara Road, Igboora, Oyo State' },
    { name: 'Eruwa District Church', address: 'Ansar-ud-deen Area, Eruwa, Oyo State' },
    { name: 'Lanlate District Church', address: 'Isale-Ofin, Lanlate, Oyo State' },
    { name: 'Ayete District Church', address: 'Idofin Area, Ayete, Oyo State' },
    { name: 'Idere Branch Church', address: 'Sabo Road, Idere, Oyo State' },
    { name: 'Igangan District Church', address: 'Oke-Ola Area, Igangan, Oyo State' },
  ];

  return (
    <div className="flex flex-col min-h-screen" id="about-page-root">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative bg-deep-navy pt-40 pb-24 text-white overflow-hidden text-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://picsum.photos/seed/about_church/1920/1080"
            alt="About DLCM Ibarapa"
            fill
            className="object-cover opacity-15"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-deep-navy/95 via-deep-navy to-spirit-white" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-royal-gold font-mono text-[10px] uppercase tracking-widest block mb-3">
            Who We Are
          </span>
          <h2 className="text-4xl sm:text-5xl font-serif font-extrabold leading-tight tracking-tight">
            Our Identity & Spiritual Legacy
          </h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed">
            Discover the history, beliefs, core values, and dedicated leadership that drive our ministry forward in the Ibarapa Region.
          </p>
        </div>
      </section>

      {/* About the Church */}
      <section className="bg-spirit-white py-16 px-4 sm:px-6 lg:px-8" id="about-story">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <ScrollFade direction="left" distance={36} className="lg:col-span-7 space-y-6">
            <h3 className="text-3xl font-serif font-bold text-deep-navy mb-4 border-l-4 border-royal-gold pl-4">
              Our Journey of Faith
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Deeper Christian Life Ministry, Ibarapa Region, is a vibrant part of the global Deeper Life Bible Church, founded by the General Superintendent, Pastor W.F. Kumuyi. For years, the Ibarapa Region has stood as a beacon of truth, scriptural sound teaching, and holiness across Igboora, Eruwa, Lanlate, Ayete, Idere, and Igangan.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Our absolute priority is to preach the Word in its simplicity and raw power, leading souls out of darkness into the marvelous light of Christ Jesus. We nurture believers to walk in holiness of life while preparing diligently for the imminent Second Coming of our Savior.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="text-sm font-bold uppercase font-mono text-royal-gold mb-2">
                  Our Mission
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  To systematically evangelize the entire Ibarapa Region, making disciples of all nations, and establishing them in scriptural holiness and sound apostolic faith.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="text-sm font-bold uppercase font-mono text-royal-gold mb-2">
                  Our Vision
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  To present a glorious, sanctified, and active church unto Christ Jesus at His second coming, grounded firmly in the Word of Truth and alive in the Spirit.
                </p>
              </div>
            </div>
          </ScrollFade>

          <ScrollFade direction="right" distance={36} delay={0.15} className="lg:col-span-5 relative aspect-square bg-gray-100 rounded-3xl overflow-hidden shadow-lg border border-royal-gold/10 min-h-[300px]">
            <Image
              src="https://picsum.photos/seed/faith_journey/800/800"
              alt="Deeper Life Worship Venue"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </ScrollFade>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-gradient-to-b from-spirit-white to-white py-20 px-4 sm:px-6 lg:px-8" id="about-values">
        <div className="max-w-6xl mx-auto">
          <ScrollFade direction="up" className="text-center mb-16">
            <span className="text-royal-gold font-mono text-[10px] uppercase tracking-widest block mb-2">
              Our Anchors
            </span>
            <h3 className="text-3xl font-serif font-bold text-deep-navy">
              Our Core Spiritual Values
            </h3>
          </ScrollFade>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <ScrollFade
                  key={v.name}
                  direction="up"
                  delay={i * 0.08}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-royal-gold/20 transition-all duration-300 text-center"
                >
                  <div className="w-12 h-12 bg-royal-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5 text-royal-gold" />
                  </div>
                  <h4 className="text-base font-serif font-bold text-deep-navy mb-2">
                    {v.name}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {v.desc}
                  </p>
                </ScrollFade>
              );
            })}
          </div>
        </div>
      </section>

      {/* Statement of Faith Accordion */}
      <section className="bg-[#EFECE1]/50 py-24 px-4 sm:px-6 lg:px-8" id="about-beliefs">
        <div className="max-w-4xl mx-auto">
          <ScrollFade direction="up" className="text-center mb-16">
            <span className="text-royal-gold font-mono text-[10px] uppercase tracking-widest block mb-2">
              Our Doctrine
            </span>
            <h3 className="text-3xl font-serif font-bold text-deep-navy">
              Statement of Faith
            </h3>
            <p className="text-sm text-gray-600 mt-2 max-w-sm mx-auto">
              What we believe and strictly defend, keeping aligned with the holy teachings of Jesus Christ.
            </p>
          </ScrollFade>

          <div className="space-y-4">
            {beliefs.map((b, i) => {
              const isOpen = openIndex === i;
              return (
                <ScrollFade
                  key={i}
                  direction="up"
                  delay={i * 0.05}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                    id={`belief-accordion-btn-${i}`}
                  >
                    <span className="text-sm sm:text-base font-serif font-bold text-deep-navy">
                      {b.title}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-royal-gold shrink-0 ml-4" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 ml-4" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-6 pb-6 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                          {b.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ScrollFade>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="bg-white py-24 px-4 sm:px-6 lg:px-8" id="about-leadership">
        <div className="max-w-5xl mx-auto">
          <ScrollFade direction="up" className="text-center mb-16">
            <span className="text-royal-gold font-mono text-[10px] uppercase tracking-widest block mb-2">
              Spiritual Oversight
            </span>
            <h3 className="text-3xl font-serif font-bold text-deep-navy">
              Regional Leadership
            </h3>
          </ScrollFade>

          {ro ? (
            <ScrollFade direction="up" distance={30} className="bg-deep-navy rounded-3xl overflow-hidden border border-royal-gold/15 shadow-xl grid grid-cols-1 md:grid-cols-12 text-white">
              <div className="md:col-span-4 relative min-h-[300px] md:min-h-full bg-white/5">
                <Image
                  src={ro.photo_url}
                  alt={ro.full_name}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="md:col-span-8 p-8 sm:p-12 flex flex-col justify-center">
                <span className="text-royal-gold font-mono text-[10px] uppercase tracking-widest block mb-2">
                  Regional Overseer
                </span>
                <h4 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-4">
                  {ro.full_name}
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {ro.bio}
                </p>
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-royal-gold block" />
                  <span className="text-xs font-mono text-royal-gold uppercase tracking-wider">
                    Overseeing Ibarapa Region, Oyo State
                  </span>
                </div>
              </div>
            </ScrollFade>
          ) : (
            <div className="text-center text-gray-500 text-sm">Loading leadership profile...</div>
          )}
        </div>
      </section>

      {/* Our Region (Branches List) */}
      <section className="bg-spirit-white py-20 px-4 sm:px-6 lg:px-8" id="about-region">
        <div className="max-w-5xl mx-auto">
          <ScrollFade direction="up" className="text-center mb-16">
            <span className="text-royal-gold font-mono text-[10px] uppercase tracking-widest block mb-2">
              Territorial Scope
            </span>
            <h3 className="text-3xl font-serif font-bold text-deep-navy">
              Our Ibarapa Region Branches
            </h3>
            <p className="text-sm text-gray-600 mt-2 max-w-sm mx-auto">
              Our region spans multiple thriving branches, keeping the local communities alive in the Spirit.
            </p>
          </ScrollFade>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {branches.map((b, idx) => (
              <ScrollFade
                key={b.name}
                direction="up"
                delay={idx * 0.08}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:border-royal-gold/15 transition-all duration-300"
              >
                <h4 className="text-sm sm:text-base font-serif font-bold text-deep-navy mb-2">
                  {b.name}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-royal-gold shrink-0" />
                  <span>{b.address}</span>
                </p>
              </ScrollFade>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
