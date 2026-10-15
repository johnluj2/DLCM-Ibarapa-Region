import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { setSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const profile = db.profiles.find(
      (p) => p.email.toLowerCase() === email.toLowerCase() && p.password === password
    );

    if (!profile) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Set cookie
    await setSessionUser(profile.id);

    // Don't send back password
    const { password: _, ...safeProfile } = profile;

    return NextResponse.json({
      success: true,
      profile: safeProfile,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login' },
      { status: 500 }
    );
  }
}
