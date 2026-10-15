import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const db = getDb();
  return NextResponse.json({ broadcast: db.broadcast_settings });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // "Manage live broadcast link": R.O. = ❌ | Church Admin = ✅ | Developer = ✅
    if (user.role === 'ro') {
      return NextResponse.json({ error: 'Regional Overseer does not have permission to manage live broadcast link' }, { status: 403 });
    }

    const { stream_url, is_live } = await req.json();

    if (stream_url === undefined || is_live === undefined) {
      return NextResponse.json({ error: 'stream_url and is_live are required' }, { status: 400 });
    }

    const db = getDb();
    db.broadcast_settings = {
      stream_url,
      is_live,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    saveDb(db);

    return NextResponse.json({ success: true, broadcast: db.broadcast_settings });
  } catch (error) {
    console.error('Error updating broadcast settings:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
