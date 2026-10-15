import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, Profile } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'developer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = getDb();
    // Developer can see all accounts, including passwords for setup management
    return NextResponse.json({ profiles: db.profiles });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'developer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { action, id, email, password, full_name, role, photo_url } = body;

    const db = getDb();

    // 1. Create a new Admin or RO account
    if (action === 'create_profile') {
      if (!email || !password || !full_name || !role) {
        return NextResponse.json({ error: 'Email, password, full name, and role are required' }, { status: 400 });
      }

      // Check if email already exists
      const exists = db.profiles.some((p) => p.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
      }

      const newProfile: Profile = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        email,
        password,
        full_name,
        role: role as 'ro' | 'admin' | 'developer',
        photo_url: photo_url || `https://picsum.photos/seed/${role}/200/200`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.profiles.push(newProfile);
      saveDb(db);

      return NextResponse.json({ success: true, profile: newProfile });
    }

    // 2. Update an existing account (including self)
    if (action === 'update_profile') {
      if (!id) {
        return NextResponse.json({ error: 'Profile ID is required for updates' }, { status: 400 });
      }

      const index = db.profiles.findIndex((p) => p.id === id);
      if (index === -1) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      // Check if trying to change email to an existing email (of a different user)
      if (email && email.toLowerCase() !== db.profiles[index].email.toLowerCase()) {
        const emailExists = db.profiles.some(
          (p) => p.id !== id && p.email.toLowerCase() === email.toLowerCase()
        );
        if (emailExists) {
          return NextResponse.json({ error: 'Email is already taken by another account' }, { status: 400 });
        }
        db.profiles[index].email = email;
      }

      if (full_name) {
        db.profiles[index].full_name = full_name;
      }
      if (password) {
        db.profiles[index].password = password;
      }
      if (role && id !== user.id) {
        // Can change other roles, but Developer cannot demote themselves to avoid locking the system
        db.profiles[index].role = role as 'ro' | 'admin' | 'developer';
      }
      if (photo_url) {
        db.profiles[index].photo_url = photo_url;
      }

      db.profiles[index].updated_at = new Date().toISOString();
      saveDb(db);

      return NextResponse.json({ success: true, profile: db.profiles[index] });
    }

    // 3. Delete an account
    if (action === 'delete_profile') {
      if (!id) {
        return NextResponse.json({ error: 'Profile ID is required for deletion' }, { status: 400 });
      }

      if (id === user.id) {
        return NextResponse.json({ error: 'You cannot delete your own developer account' }, { status: 400 });
      }

      db.profiles = db.profiles.filter((p) => p.id !== id);
      saveDb(db);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in POST settings:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
