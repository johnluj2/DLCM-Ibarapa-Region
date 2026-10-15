import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, NewsletterPdf } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

// Public GET: retrieve newsletter PDFs sorted by date
export async function GET() {
  try {
    const db = getDb();
    const newsletters = db.newsletters || [];
    // Sort latest first by default
    const sorted = [...newsletters].sort((a, b) => 
      new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
    );
    return NextResponse.json({ success: true, newsletters: sorted });
  } catch (error) {
    console.error('Error getting newsletters:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Authenticated POST: Upload PDF and save metadata
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role === 'ro') {
      return NextResponse.json({ error: 'Regional Overseer does not have permission to upload newsletters.' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const publishDate = formData.get('publishDate') as string | null;
    const description = formData.get('description') as string | null;

    if (!file || !title || !publishDate) {
      return NextResponse.json({ error: 'File, title, and publish date are required.' }, { status: 400 });
    }

    // Check file type
    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are allowed.' }, { status: 400 });
    }

    // Read file bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure upload directory exists
    const dirPath = path.join(process.cwd(), 'public', 'newsletters');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Generate safe, unique filename
    const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const filePath = path.join(dirPath, safeFilename);

    // Save physical file
    fs.writeFileSync(filePath, buffer);

    const pdfUrl = `/newsletters/${safeFilename}`;

    const db = getDb();
    if (!db.newsletters) {
      db.newsletters = [];
    }

    const newPdf: NewsletterPdf = {
      id: 'news-pdf-' + Math.random().toString(36).substr(2, 9),
      title,
      pdf_url: pdfUrl,
      publish_date: publishDate,
      description: description || '',
      uploaded_by: user.id,
      created_at: new Date().toISOString()
    };

    db.newsletters.unshift(newPdf);
    saveDb(db);

    return NextResponse.json({ success: true, newsletter: newPdf });
  } catch (error) {
    console.error('Error uploading newsletter PDF:', error);
    return NextResponse.json({ error: 'Server error during upload.' }, { status: 500 });
  }
}

// Authenticated DELETE: Delete newsletter PDF
export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role === 'ro') {
      return NextResponse.json({ error: 'Regional Overseer does not have permission to delete newsletters.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Newsletter ID is required.' }, { status: 400 });
    }

    const db = getDb();
    const newsletters = db.newsletters || [];
    const index = newsletters.findIndex((n) => n.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Newsletter not found.' }, { status: 404 });
    }

    const newsletter = newsletters[index];

    // Try to delete physical file if it starts with /newsletters/
    if (newsletter.pdf_url.startsWith('/newsletters/')) {
      const filePath = path.join(process.cwd(), 'public', newsletter.pdf_url);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error('Failed to delete physical file:', err);
      }
    }

    newsletters.splice(index, 1);
    db.newsletters = newsletters;
    saveDb(db);

    return NextResponse.json({ success: true, message: 'Newsletter deleted successfully.' });
  } catch (error) {
    console.error('Error deleting newsletter:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
