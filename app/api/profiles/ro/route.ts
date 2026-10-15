import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  // Find R.O. profile
  const ro = db.profiles.find((p) => p.role === 'ro');
  if (!ro) {
    return NextResponse.json({ error: 'Regional Overseer profile not found' }, { status: 404 });
  }

  // Return public details only
  return NextResponse.json({
    full_name: ro.full_name,
    photo_url: ro.photo_url,
    role: ro.role,
    // Let's add a short inspirational bio suitable for the RO
    bio: 'Pastor Oyegoke is a seasoned and Spirit-filled minister of the Gospel with decades of experience in pastoral leadership, spiritual growth, and scriptural exposition. He has been serving the Ibarapa Region with great fire and dedication, guiding thousands into deep fellowship with Christ and absolute holiness of life.',
  });
}
