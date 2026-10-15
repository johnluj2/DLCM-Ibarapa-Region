import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, Program } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const db = getDb();
  // Filter only published programs for public view if not logged in?
  // Let's return all, and the frontend can handle published vs draft or we can return all because the admin needs to see all.
  return NextResponse.json({ programs: db.programs });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, event_date, event_time, poster_url, status } = await req.json();

    if (!title || !event_date || !event_time) {
      return NextResponse.json({ error: 'Title, date, and time are required' }, { status: 400 });
    }

    const db = getDb();
    
    // Check if editing an existing program
    const body = await req.clone().json();
    const existingId = body.id;

    if (existingId) {
      const index = db.programs.findIndex(p => p.id === existingId);
      if (index !== -1) {
        db.programs[index] = {
          ...db.programs[index],
          title,
          description: description || '',
          event_date,
          event_time,
          poster_url: poster_url || 'https://picsum.photos/seed/defaultprogram/800/600',
          status: status || 'published',
        };
        saveDb(db);
        return NextResponse.json({ success: true, program: db.programs[index] });
      }
    }

    const newProgram: Program = {
      id: 'prog-' + Math.random().toString(36).substr(2, 9),
      title,
      description: description || '',
      event_date,
      event_time,
      poster_url: poster_url || 'https://picsum.photos/seed/defaultprogram/800/600',
      status: status || 'published',
      posted_by: user.id,
      created_at: new Date().toISOString(),
    };

    db.programs.unshift(newProgram);
    saveDb(db);

    return NextResponse.json({ success: true, program: newProgram });
  } catch (error) {
    console.error('Error posting program:', error);
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
      return NextResponse.json({ error: 'Program ID required' }, { status: 400 });
    }

    const db = getDb();
    db.programs = db.programs.filter((p) => p.id !== id);
    saveDb(db);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
