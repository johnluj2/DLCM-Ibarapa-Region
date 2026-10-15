'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin, MessageSquare, BookOpen, Clock, CalendarCheck, CheckCircle2, ChevronDown, Send, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import ScrollFade from '@/components/ScrollFade';

export default function ConnectPage() {
  // Form categories / tabs
  const [activeTab, setActiveTab] = useState<'contact' | 'testimony' | 'appointment' | 'feedback' | 'newsletter'>('contact');

  // Success notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [feedbackForm, setFeedbackForm] = useState({ name: '', email: '', phone: '', message: '', category: 'General' });
  const [testimonyForm, setTestimonyForm] = useState({ full_name: '', contact: '', message: '', publish_ok: true });
  const [newsletterForm, setNewsletterForm] = useState({ full_name: '', email: '' });
  const [appointmentForm, setAppointmentForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    appt_type: 'counseling',
    appt_date: '',
    appt_time: 'morning',
    message: '',
    referrer: 'Friend/Family',
  });

  const clearForms = () => {
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setFeedbackForm({ name: '', email: '', phone: '', message: '', category: 'General' });
    setTestimonyForm({ full_name: '', contact: '', message: '', publish_ok: true });
    setNewsletterForm({ full_name: '', email: '' });
    setAppointmentForm({
      full_name: '',
      phone: '',
      email: '',
      appt_type: 'counseling',
      appt_date: '',
      appt_time: 'morning',
      message: '',
      referrer: 'Friend/Family',
    });
  };

  const handleFormSubmit = async (e: React.FormEvent, type: string) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    let payload: any = {};
    let endpoint = '/api/submissions';

    if (type === 'contact') {
      if (!contactForm.name || !contactForm.email || !contactForm.message) {
        setErrorMsg('Please fill in all required fields.');
        setLoading(false);
        return;
      }
      payload = {
        type: 'contact',
        full_name: contactForm.name,
        email: contactForm.email,
        message: `${contactForm.subject ? `[Subject: ${contactForm.subject}] ` : ''}${contactForm.message}`,
      };
    } else if (type === 'feedback') {
      if (!feedbackForm.name || !feedbackForm.message) {
        setErrorMsg('Name and Message are required.');
        setLoading(false);
        return;
      }
      payload = {
        type: 'feedback',
        full_name: feedbackForm.name,
        email: feedbackForm.email,
        phone: feedbackForm.phone,
        message: feedbackForm.message,
        category: feedbackForm.category,
      };
    } else if (type === 'testimony') {
      if (!testimonyForm.full_name || !testimonyForm.message) {
        setErrorMsg('Name and Testimony Message are required.');
        setLoading(false);
        return;
      }
      payload = {
        type: 'testimony',
        full_name: testimonyForm.full_name,
        email: testimonyForm.contact.includes('@') ? testimonyForm.contact : '',
        phone: !testimonyForm.contact.includes('@') ? testimonyForm.contact : '',
        message: testimonyForm.message,
        publish_ok: testimonyForm.publish_ok,
      };
    } else if (type === 'appointment') {
      if (!appointmentForm.full_name || !appointmentForm.phone || !appointmentForm.appt_date) {
        setErrorMsg('Full Name, Phone, and Preferred Date are required.');
        setLoading(false);
        return;
      }

      // Check if date is weekday (Monday to Friday, 1 to 5)
      const selectedDay = new Date(appointmentForm.appt_date).getDay();
      if (selectedDay === 0 || selectedDay === 6) {
        setErrorMsg('Appointments can only be booked for weekdays (Monday to Friday).');
        setLoading(false);
        return;
      }

      payload = {
        type: 'appointment',
        full_name: appointmentForm.full_name,
        email: appointmentForm.email,
        phone: appointmentForm.phone,
        appt_type: appointmentForm.appt_type,
        appt_date: appointmentForm.appt_date,
        appt_time: appointmentForm.appt_time,
        message: `${appointmentForm.message ? `[Reason: ${appointmentForm.message}] ` : ''}[Source: ${appointmentForm.referrer}]`,
      };
    } else if (type === 'newsletter') {
      if (!newsletterForm.full_name || !newsletterForm.email) {
        setErrorMsg('Name and email are required.');
        setLoading(false);
        return;
      }
      endpoint = '/api/newsletter';
      payload = {
        action: 'subscribe',
        full_name: newsletterForm.full_name,
        email: newsletterForm.email,
      };
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg(data.message || 'Thank you! Your submission has been securely delivered to DLCM Ibarapa Administration.');
        clearForms();
      } else {
        setErrorMsg(data.error || 'Failed to submit form. Please check your inputs and try again.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'contact', label: 'Contact Us', desc: 'General inquiries and messages' },
    { id: 'testimony', label: 'Share Testimony', desc: 'Tell us of God\'s wonderful works' },
    { id: 'appointment', label: 'Book Appointment', desc: 'Counseling or pastoral guidance' },
    { id: 'feedback', label: 'Submit Feedback', desc: 'Complaints, reviews, suggestions' },
    { id: 'newsletter', label: 'Newsletter', desc: 'Subscribe to weekly bulletins' },
  ];

  return (
    <div className="flex flex-col min-h-screen" id="connect-page-root">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative bg-deep-navy pt-40 pb-20 text-white overflow-hidden text-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://picsum.photos/seed/connect_hero/1920/1080"
            alt="Connect with us"
            fill
            className="object-cover opacity-15"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-deep-navy/95 via-deep-navy to-spirit-white" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-royal-gold font-mono text-[10px] uppercase tracking-widest block mb-3">
            Relational Hub
          </span>
          <h2 className="text-4xl sm:text-5xl font-serif font-extrabold leading-tight tracking-tight">
            {"We'd Love to Hear From You"}
          </h2>
          <p className="text-gray-300 text-xs sm:text-sm max-w-lg mx-auto mt-4 leading-relaxed">
            Reach out with requests, share testimonies of faith, register for appointments, or send suggestions to the ministry office.
          </p>
        </div>
      </section>

      {/* Hub split section */}
      <section className="bg-spirit-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Side: Contact Information & Find Us */}
          <div className="lg:col-span-5 space-y-8">
            <ScrollFade direction="left" className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-xl font-serif font-bold text-deep-navy border-b border-royal-gold/20 pb-2">
                Regional Contact Office
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-royal-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-mono font-bold text-gray-400 uppercase">HEADQUARTERS</h4>
                    <p className="text-sm text-gray-700 font-medium">
                      DLCM Ibarapa Regional Headquarters, Bara Road, Igboora, Oyo State, Nigeria
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-royal-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-mono font-bold text-gray-400 uppercase">TELEPHONE</h4>
                    <p className="text-sm text-gray-700 font-medium">+234 80 1234 5678</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-royal-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-mono font-bold text-gray-400 uppercase">EMAIL</h4>
                    <p className="text-sm text-gray-700 font-medium">office@dlcmibarapa.org</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-50 pt-6">
                <a
                  href="https://wa.me/2348012345678"
                  target="_blank"
                  rel="noreferrer"
                  id="whatsapp-contact-btn"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-150"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat directly on WhatsApp</span>
                </a>
              </div>
            </ScrollFade>

            {/* Google Maps embed */}
            <ScrollFade direction="up" delay={0.15} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm aspect-video relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15816.634351336081!2d3.2778643500000003!3d7.4476906!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103a0ff998b671a5%3A0xebe6e522a613620!2sIgboora%2C%20Oyo!5e0!3m2!1sen!2sng!4v1680000000000!5m2!1sen!2sng"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </ScrollFade>
          </div>

          {/* Right Side: Interactive Forms Core */}
          <ScrollFade direction="right" delay={0.1} className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-lg p-6 sm:p-10" id="forms-hub">
            {/* Forms selector tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-6 mb-8" id="forms-selectors">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSuccessMsg(null);
                    setErrorMsg(null);
                  }}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-deep-navy text-royal-gold shadow'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                  id={`tab-selector-${tab.id}`}
                  title={tab.desc}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Global Success / Error notifications */}
            {successMsg && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start space-x-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-sans leading-normal">{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Form Bodies */}
            <AnimatePresence mode="wait">
              {activeTab === 'contact' && (
                <motion.form
                  key="contact-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={(e) => handleFormSubmit(e, 'contact')}
                  className="space-y-5"
                  id="form-contact"
                >
                  <h4 className="text-lg font-serif font-bold text-deep-navy">Send a Message</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Full Name *</label>
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Email Address *</label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Subject</label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Your Message *</label>
                    <textarea
                      rows={5}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-deep-navy text-royal-gold hover:text-white font-bold uppercase tracking-wider text-xs py-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </motion.form>
              )}

              {activeTab === 'testimony' && (
                <motion.form
                  key="testimony-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={(e) => handleFormSubmit(e, 'testimony')}
                  className="space-y-5"
                  id="form-testimony"
                >
                  <h4 className="text-lg font-serif font-bold text-deep-navy">Share Your Testimony</h4>
                  <p className="text-xs text-gray-500">
                    Your story can ignite faith in others. Tell us what the Lord has done for you!
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Full Name *</label>
                      <input
                        type="text"
                        value={testimonyForm.full_name}
                        onChange={(e) => setTestimonyForm({ ...testimonyForm, full_name: e.target.value })}
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Phone Number or Email</label>
                      <input
                        type="text"
                        placeholder="For verification"
                        value={testimonyForm.contact}
                        onChange={(e) => setTestimonyForm({ ...testimonyForm, contact: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Your Testimony *</label>
                    <textarea
                      rows={5}
                      value={testimonyForm.message}
                      onChange={(e) => setTestimonyForm({ ...testimonyForm, message: e.target.value })}
                      required
                      placeholder="Type details of God's power and miracles..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold resize-none"
                    />
                  </div>

                  <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <input
                      type="checkbox"
                      id="publish_ok"
                      checked={testimonyForm.publish_ok}
                      onChange={(e) => setTestimonyForm({ ...testimonyForm, publish_ok: e.target.checked })}
                      className="h-4.5 w-4.5 rounded border-gray-300 text-deep-navy focus:ring-royal-gold accent-deep-navy"
                    />
                    <label htmlFor="publish_ok" className="text-xs text-gray-600 cursor-pointer">
                      I give permission to publish this testimony on the church website homepage once approved.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-deep-navy text-royal-gold hover:text-white font-bold uppercase tracking-wider text-xs py-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Submitting...' : 'Submit Testimony'}</span>
                  </button>
                </motion.form>
              )}

              {activeTab === 'appointment' && (
                <motion.form
                  key="appointment-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={(e) => handleFormSubmit(e, 'appointment')}
                  className="space-y-5"
                  id="form-appointment"
                >
                  <h4 className="text-lg font-serif font-bold text-deep-navy">Book a Pastoral Appointment</h4>
                  <p className="text-xs text-gray-500">
                    Schedule a private, weekdays-only meeting with the Regional Overseer or pastorate.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Full Name *</label>
                      <input
                        type="text"
                        value={appointmentForm.full_name}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, full_name: e.target.value })}
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Phone Number *</label>
                      <input
                        type="tel"
                        value={appointmentForm.phone}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, phone: e.target.value })}
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Email Address (Optional)</label>
                      <input
                        type="email"
                        value={appointmentForm.email}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, email: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Appointment Type *</label>
                      <select
                        value={appointmentForm.appt_type}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, appt_type: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold"
                      >
                        <option value="counseling">Spiritual Counseling</option>
                        <option value="guidance">Pastoral Guidance</option>
                        <option value="visitation">Family/Sick Visitation</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Preferred Date * (Weekdays Only)</label>
                      <input
                        type="date"
                        value={appointmentForm.appt_date}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, appt_date: e.target.value })}
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Preferred Time Session *</label>
                      <select
                        value={appointmentForm.appt_time}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, appt_time: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold"
                      >
                        <option value="morning">Morning (9:00 AM — 12:00 PM)</option>
                        <option value="afternoon">Afternoon (12:00 PM — 3:00 PM)</option>
                        <option value="evening">Evening (3:00 PM — 6:00 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">How did you hear about us?</label>
                      <select
                        value={appointmentForm.referrer}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, referrer: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold"
                      >
                        <option value="Friend/Family">Friend / Family</option>
                        <option value="Social Media">Social Media (FB, YouTube)</option>
                        <option value="Street Outreach">Street Evangelism/Outreach</option>
                        <option value="Website">Web Search/Portal</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Brief Description of Need</label>
                    <textarea
                      rows={3}
                      value={appointmentForm.message}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, message: e.target.value })}
                      placeholder="Describe briefly so the team can prepare..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-deep-navy text-royal-gold hover:text-white font-bold uppercase tracking-wider text-xs py-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>{loading ? 'Booking...' : 'Book Appointment'}</span>
                  </button>
                </motion.form>
              )}

              {activeTab === 'feedback' && (
                <motion.form
                  key="feedback-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={(e) => handleFormSubmit(e, 'feedback')}
                  className="space-y-5"
                  id="form-feedback"
                >
                  <h4 className="text-lg font-serif font-bold text-deep-navy">Submit Feedback</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Your Name *</label>
                      <input
                        type="text"
                        value={feedbackForm.name}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Feedback Category *</label>
                      <select
                        value={feedbackForm.category}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, category: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold"
                      >
                        <option value="General">General Review</option>
                        <option value="Service Feedback">Service Experience</option>
                        <option value="Suggestion">System Suggestion</option>
                        <option value="Complaint">Amnesty Complaint</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Email Address (Optional)</label>
                      <input
                        type="email"
                        value={feedbackForm.email}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        value={feedbackForm.phone}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, phone: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Your Feedback Message *</label>
                    <textarea
                      rows={5}
                      value={feedbackForm.message}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-deep-navy text-royal-gold hover:text-white font-bold uppercase tracking-wider text-xs py-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Submitting...' : 'Submit Feedback'}</span>
                  </button>
                </motion.form>
              )}

              {activeTab === 'newsletter' && (
                <motion.form
                  key="newsletter-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={(e) => handleFormSubmit(e, 'newsletter')}
                  className="space-y-5"
                  id="form-newsletter"
                >
                  <h4 className="text-lg font-serif font-bold text-deep-navy">Subscribe to the Regional Newsletter</h4>
                  <p className="text-xs text-gray-500">
                    Receive weekly nuggets, service reminders, pastoral letters, and spiritual insights directly in your email.
                  </p>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Your Full Name *</label>
                    <input
                      type="text"
                      value={newsletterForm.full_name}
                      onChange={(e) => setNewsletterForm({ ...newsletterForm, full_name: e.target.value })}
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Email Address *</label>
                    <input
                      type="email"
                      value={newsletterForm.email}
                      onChange={(e) => setNewsletterForm({ ...newsletterForm, email: e.target.value })}
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal-gold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-deep-navy text-royal-gold hover:text-white font-bold uppercase tracking-wider text-xs py-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{loading ? 'Subscribing...' : 'Subscribe Now'}</span>
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </ScrollFade>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
