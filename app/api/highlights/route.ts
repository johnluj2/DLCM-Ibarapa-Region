import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, Highlight } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const db = getDb();
  return NextResponse.json({ highlights: db.highlights });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      program_name,
      program_date,
      description,
      service_type,
      photo_urls,
      video_url,
      audio_url,
      sermon_title,
      preacher_name,
      allow_download,
    } = body;

    if (!program_name || !program_date || !description || !service_type) {
      return NextResponse.json({ error: 'Program name, date, description, and service type are required' }, { status: 400 });
    }

    const db = getDb();

    if (id) {
      // Edit existing
      const index = db.highlights.findIndex((h) => h.id === id);
      if (index !== -1) {
        db.highlights[index] = {
          ...db.highlights[index],
          program_name,
          program_date,
          description,
          service_type,
          photo_urls: photo_urls || [],
          video_url: video_url || '',
          audio_url: audio_url || '',
          sermon_title: sermon_title || '',
          preacher_name: preacher_name || '',
          allow_download: allow_download !== undefined ? allow_download : true,
        };
        saveDb(db);
        return NextResponse.json({ success: true, highlight: db.highlights[index] });
      }
    }

    // Create new
    const newHighlight: Highlight = {
      id: 'high-' + Math.random().toString(36).substr(2, 9),
      program_name,
      program_date,
      description,
      service_type,
      photo_urls: photo_urls || [],
      video_url: video_url || '',
      audio_url: audio_url || '',
      sermon_title: sermon_title || '',
      preacher_name: preacher_name || '',
      allow_download: allow_download !== undefined ? allow_download : true,
      download_count: 0,
      posted_by: user.id,
      created_at: new Date().toISOString(),
    };

    db.highlights.unshift(newHighlight);
    saveDb(db);

    return NextResponse.json({ success: true, highlight: newHighlight });
  } catch (error) {
    console.error('Error posting highlight:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (!id) {
      return NextResponse.json({ error: 'Highlight ID is required' }, { status: 400 });
    }

    const db = getDb();
    const index = db.highlights.findIndex((h) => h.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Highlight not found' }, { status: 404 });
    }

    if (action === 'download') {
      db.highlights[index].download_count += 1;
      saveDb(db);
      return NextResponse.json({ success: true, download_count: db.highlights[index].download_count });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in PATCH highlight:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'admin' && user.role !== 'developer')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Highlight ID required' }, { status: 400 });
    }

    const db = getDb();
    db.highlights = db.highlights.filter((h) => h.id !== id);
    saveDb(db);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting highlight:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
