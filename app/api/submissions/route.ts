import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, Submission } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const db = getDb();
    return NextResponse.json({ submissions: db.submissions });
  } catch (error) {
    console.error('Error in GET submissions:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type,
      full_name,
      email,
      phone,
      message,
      category,
      appt_type,
      appt_date,
      appt_time,
      publish_ok,
    } = body;

    if (!type || !full_name || !message) {
      return NextResponse.json({ error: 'Type, Name, and Message are required' }, { status: 400 });
    }

    if (!['feedback', 'testimony', 'appointment', 'contact'].includes(type)) {
      return NextResponse.json({ error: 'Invalid submission type' }, { status: 400 });
    }

    const db = getDb();
    const newSubmission: Submission = {
      id: 'sub-' + Math.random().toString(36).substr(2, 9),
      type,
      full_name,
      email: email || '',
      phone: phone || '',
      message,
      category: category || undefined,
      appt_type: appt_type || undefined,
      appt_date: appt_date || undefined,
      appt_time: appt_time || undefined,
      status: type === 'testimony' ? 'pending' : 'unread',
      admin_notes: '',
      publish_ok: publish_ok !== undefined ? publish_ok : undefined,
      created_at: new Date().toISOString(),
    };

    db.submissions.unshift(newSubmission);
    saveDb(db);

    return NextResponse.json({ success: true, submission: newSubmission });
  } catch (error) {
    console.error('Error posting submission:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    const db = getDb();
    const index = db.submissions.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Checking permissions:
    // "Reply to bookings / mark as handled": R.O. cannot do this! Only Admin and Developer can!
    // Wait, let's look at the PRD Roles matrix:
    // "Reply to bookings / mark as handled": Regional Overseer = ❌ | Church Admin = ✅ | Developer = ✅
    if (db.submissions[index].type === 'appointment' && user.role === 'ro') {
      return NextResponse.json({ error: 'Regional Overseer does not have permission to handle appointments' }, { status: 403 });
    }

    if (status) {
      db.submissions[index].status = status;
    }
    if (admin_notes !== undefined) {
      db.submissions[index].admin_notes = admin_notes;
    }

    saveDb(db);
    return NextResponse.json({ success: true, submission: db.submissions[index] });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
