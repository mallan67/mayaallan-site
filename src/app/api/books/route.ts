// src/app/api/books/route.ts
import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { book } from '../../../db/schema';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // basic validation
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: 'title and slug required' }, { status: 400 });
    }

    const [row] = await db.insert(book).values({
      title: String(body.title),
      slug: String(body.slug),
      coming_soon: !!body.coming_soon,
      // add other fields as desired
    }).returning();

    return NextResponse.json({ ok: true, row });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
