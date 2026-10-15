import fs from 'fs';
import path from 'path';

export interface Profile {
  id: string;
  email: string;
  password?: string; // Stored securely/simply for prototype
  full_name: string;
  role: 'ro' | 'admin' | 'developer';
  photo_url: string;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  event_date: string; // YYYY-MM-DD
  event_time: string; // HH:MM
  poster_url: string;
  status: 'published' | 'draft';
  posted_by: string;
  created_at: string;
}

export interface Highlight {
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
  posted_by: string;
  created_at: string;
}

export interface Submission {
  id: string;
  type: 'feedback' | 'testimony' | 'appointment' | 'contact';
  full_name: string;
  email: string;
  phone: string;
  message: string;
  category?: string; // feedback type
  appt_type?: 'counseling' | 'guidance' | 'visitation';
  appt_date?: string;
  appt_time?: string;
  status: 'unread' | 'read' | 'pending' | 'confirmed' | 'declined' | 'approved' | 'rejected';
  admin_notes: string;
  publish_ok?: boolean; // testimonies
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  full_name: string;
  email: string;
  status: 'active' | 'unsubscribed';
  created_at: string;
}

export interface NewsletterCampaign {
  id: string;
  subject: string;
  body: string;
  sent_by: string;
  sent_at: string;
  recipient_count: number;
}

export interface BroadcastSettings {
  stream_url: string;
  is_live: boolean;
  updated_by: string;
  updated_at: string;
}

export interface NewsletterPdf {
  id: string;
  title: string;
  pdf_url: string;
  publish_date: string; // YYYY-MM-DD
  description?: string;
  uploaded_by: string;
  created_at: string;
}

export interface DbSchema {
  profiles: Profile[];
  programs: Program[];
  highlights: Highlight[];
  submissions: Submission[];
  newsletter_subscribers: NewsletterSubscriber[];
  newsletter_campaigns: NewsletterCampaign[];
  broadcast_settings: BroadcastSettings;
  newsletters?: NewsletterPdf[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

const defaultDb: DbSchema = {
  profiles: [
    {
      id: 'dev-user-id',
      email: 'dev@dlcmibarapa.org',
      password: 'developer2026',
      full_name: 'Delight Tech Developer',
      role: 'developer',
      photo_url: 'https://picsum.photos/seed/developer/200/200',
      created_at: '2026-06-01T12:00:00Z',
      updated_at: '2026-06-01T12:00:00Z'
    },
    {
      id: 'ro-user-id',
      email: 'ro@dlcmibarapa.org',
      password: 'overseer2026',
      full_name: 'Pastor J. O. Oyegoke',
      role: 'ro',
      photo_url: 'https://picsum.photos/seed/overseer/200/200',
      created_at: '2026-06-01T12:00:00Z',
      updated_at: '2026-06-01T12:00:00Z'
    },
    {
      id: 'admin-user-id',
      email: 'admin@dlcmibarapa.org',
      password: 'admin2026',
      full_name: 'Brother Samuel Adebayo',
      role: 'admin',
      photo_url: 'https://picsum.photos/seed/admin/200/200',
      created_at: '2026-06-01T12:00:00Z',
      updated_at: '2026-06-01T12:00:00Z'
    }
  ],
  programs: [
    {
      id: 'prog-1',
      title: 'Power Night of Supernatural Turnaround',
      description: 'Join us for a specialized session of dynamic prayers, absolute holiness, and raw deliverance as we witness the power of God in action.',
      event_date: '2026-07-16', // Third Thursday of July 2026 (computed Power Night)
      event_time: '18:00',
      poster_url: 'https://picsum.photos/seed/powernight/800/600',
      status: 'published',
      posted_by: 'admin-user-id',
      created_at: '2026-06-20T10:00:00Z'
    },
    {
      id: 'prog-2',
      title: 'Regional Youth Revival Summit',
      description: 'A special gathering for all youth across the Ibarapa Region. Theme: Vessel unto Honour, sanctified and meet for the Master\'s use.',
      event_date: '2026-07-04',
      event_time: '09:00',
      poster_url: 'https://picsum.photos/seed/youth/800/600',
      status: 'published',
      posted_by: 'admin-user-id',
      created_at: '2026-06-22T08:30:00Z'
    }
  ],
  highlights: [
    {
      id: 'high-1',
      program_name: 'Sunday Worship Service',
      program_date: '2026-06-21',
      description: 'An extraordinary time in God\'s presence. Pastor Oyegoke preached on "The Unfailing Power of the Word of God", highlighting the necessity of absolute trust in God\'s promises for absolute victory.',
      service_type: 'sunday',
      photo_urls: [
        'https://picsum.photos/seed/church1/800/600',
        'https://picsum.photos/seed/church2/800/600',
        'https://picsum.photos/seed/church3/800/600'
      ],
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder video embed
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Standard free mock mp3
      sermon_title: 'The Unfailing Power of the Word of God',
      preacher_name: 'Pastor J. O. Oyegoke',
      allow_download: true,
      download_count: 42,
      posted_by: 'admin-user-id',
      created_at: '2026-06-21T13:00:00Z'
    },
    {
      id: 'high-2',
      program_name: 'Revival Hour',
      program_date: '2026-06-18',
      description: 'An explosive session of prayers. Many were delivered, healed, and set on fire for God. The message focused on sustained spiritual vigor.',
      service_type: 'revival',
      photo_urls: [
        'https://picsum.photos/seed/revival1/800/600',
        'https://picsum.photos/seed/revival2/800/600'
      ],
      video_url: '',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      sermon_title: 'Unlocking Heavens Through Unceasing Prayers',
      preacher_name: 'Pastor J. O. Oyegoke',
      allow_download: true,
      download_count: 18,
      posted_by: 'admin-user-id',
      created_at: '2026-06-18T19:30:00Z'
    },
    {
      id: 'high-3',
      program_name: 'Bible Study',
      program_date: '2026-06-15',
      description: 'A deep-dive exposition of Romans Chapter 8. The study illuminated our eternal security, the leading of the Spirit, and the believer\'s triumph over life\'s struggles.',
      service_type: 'bible_study',
      photo_urls: [
        'https://picsum.photos/seed/study1/800/600'
      ],
      video_url: '',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      sermon_title: 'The Believer\'s Triumph in Christ Jesus',
      preacher_name: 'Pastor J. O. Oyegoke',
      allow_download: true,
      download_count: 29,
      posted_by: 'admin-user-id',
      created_at: '2026-06-15T20:00:00Z'
    }
  ],
  submissions: [
    {
      id: 'sub-1',
      type: 'testimony',
      full_name: 'Sister Comfort Adeola',
      email: 'comfort@example.com',
      phone: '+2348012345678',
      message: 'I want to thank God for healing me of severe chronic back pain of 5 years during the last Power Night. Since the prayer of faith, I have been jumping, running, and doing all my chores with zero pain. Glory to God!',
      status: 'approved',
      admin_notes: 'Verified testimony during Sunday service feedback.',
      publish_ok: true,
      created_at: '2026-06-20T14:22:00Z'
    },
    {
      id: 'sub-2',
      type: 'appointment',
      full_name: 'Brother Joshua Okanlawon',
      email: 'joshua@example.com',
      phone: '+2348087654321',
      message: 'I am seeking pastoral guidance regarding a family decision and career path. I would appreciate counseling from the Regional Overseer.',
      appt_type: 'counseling',
      appt_date: '2026-07-01',
      appt_time: 'morning',
      status: 'pending',
      admin_notes: '',
      created_at: '2026-06-23T09:15:00Z'
    },
    {
      id: 'sub-3',
      type: 'feedback',
      full_name: 'Anonymous Visitor',
      email: '',
      phone: '',
      message: 'The sound quality on the audio sermons page is crystal clear. Thank you for making these resources accessible to us!',
      category: 'General',
      status: 'unread',
      admin_notes: '',
      created_at: '2026-06-23T16:45:00Z'
    }
  ],
  newsletter_subscribers: [
    {
      id: 'subscr-1',
      full_name: 'Dele Johnson',
      email: 'dele@example.com',
      status: 'active',
      created_at: '2026-06-10T11:00:00Z'
    },
    {
      id: 'subscr-2',
      full_name: 'Grace Alabi',
      email: 'grace@example.com',
      status: 'active',
      created_at: '2026-06-18T15:30:00Z'
    }
  ],
  newsletter_campaigns: [
    {
      id: 'camp-1',
      subject: 'DLCM Ibarapa Weekly Nuggets - Holiness and Vigor',
      body: '<p>Beloved, we welcome you to another week of spiritual growth. Remember that without holiness, no man shall see the Lord. Let us walk in the Spirit and feed daily on the Word.</p>',
      sent_by: 'admin-user-id',
      sent_at: '2026-06-21T06:00:00Z',
      recipient_count: 2
    }
  ],
  broadcast_settings: {
    stream_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Standard default video iframe source
    is_live: false,
    updated_by: 'admin-user-id',
    updated_at: '2026-06-20T12:00:00Z'
  },
  newsletters: [
    {
      id: 'news-pdf-1',
      title: 'DCLM Weekly Bulletin — June 21, 2026',
      pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      publish_date: '2026-06-21',
      description: 'Weekly Christian teaching, church announcements, and spiritual nuggets for the week of June 21, 2026.',
      uploaded_by: 'admin-user-id',
      created_at: '2026-06-21T06:00:00Z'
    },
    {
      id: 'news-pdf-2',
      title: 'DCLM Weekly Bulletin — June 14, 2026',
      pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      publish_date: '2026-06-14',
      description: 'Weekly Christian teaching focusing on the power of faith and walking in the Holy Spirit.',
      uploaded_by: 'admin-user-id',
      created_at: '2026-06-14T06:00:00Z'
    }
  ]
};

export function getDb(): DbSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      ensureDirectoryExistence(DB_PATH);
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), 'utf-8');
      return defaultDb;
    }
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(content);
    if (!db.newsletters) {
      db.newsletters = defaultDb.newsletters || [];
      saveDb(db);
    }
    return db;
  } catch (error) {
    console.error('Error reading database file:', error);
    return defaultDb;
  }
}

export function saveDb(data: DbSchema): boolean {
  try {
    ensureDirectoryExistence(DB_PATH);
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to database file:', error);
    return false;
  }
}
