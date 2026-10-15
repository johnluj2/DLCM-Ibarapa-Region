import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, NewsletterSubscriber, NewsletterCampaign } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const db = getDb();
    return NextResponse.json({
      subscribers: db.newsletter_subscribers,
      campaigns: db.newsletter_campaigns,
    });
  } catch (error) {
    console.error('Error getting newsletter data:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, full_name, email, subject, campaign_body } = body;

    const db = getDb();

    // 1. Subscribe (Public action)
    if (action === 'subscribe') {
      if (!email || !full_name) {
        return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
      }

      // Check if already subscribed
      const existing = db.newsletter_subscribers.find(
        (s) => s.email.toLowerCase() === email.toLowerCase()
      );

      if (existing) {
        if (existing.status === 'unsubscribed') {
          existing.status = 'active';
          saveDb(db);
          return NextResponse.json({ success: true, message: 'Resubscribed successfully!' });
        }
        return NextResponse.json({ success: true, message: 'Already subscribed!' });
      }

      const newSub: NewsletterSubscriber = {
        id: 'subscr-' + Math.random().toString(36).substr(2, 9),
        full_name,
        email,
        status: 'active',
        created_at: new Date().toISOString(),
      };

      db.newsletter_subscribers.push(newSub);
      saveDb(db);

      return NextResponse.json({ success: true, message: 'Subscribed successfully!' });
    }

    // 2. Send Campaign (Admin / Developer action)
    if (action === 'send_campaign') {
      const user = await getSessionUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // "Send newsletter": R.O. = ❌ | Church Admin = ✅ | Developer = ✅
      if (user.role === 'ro') {
        return NextResponse.json({ error: 'Regional Overseer does not have permission to send campaigns' }, { status: 403 });
      }

      if (!subject || !campaign_body) {
        return NextResponse.json({ error: 'Subject and campaign body are required' }, { status: 400 });
      }

      const activeSubscribers = db.newsletter_subscribers.filter((s) => s.status === 'active');
      
      const newCampaign: NewsletterCampaign = {
        id: 'camp-' + Math.random().toString(36).substr(2, 9),
        subject,
        body: campaign_body,
        sent_by: user.id,
        sent_at: new Date().toISOString(),
        recipient_count: activeSubscribers.length,
      };

      db.newsletter_campaigns.unshift(newCampaign);
      saveDb(db);

      return NextResponse.json({
        success: true,
        campaign: newCampaign,
        message: `Campaign sent successfully to ${activeSubscribers.length} active subscribers!`,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error posting newsletter:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
