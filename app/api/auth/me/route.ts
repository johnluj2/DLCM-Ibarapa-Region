import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Exclude password from response
  const { password: _, ...safeUser } = user;
  return NextResponse.json({ authenticated: true, user: safeUser });
}
