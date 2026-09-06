import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { getSession } from "@/lib/dal";
import { ALL_TAGS } from "@/lib/airtable/constants";

/**
 * Busts every Airtable cache tag (stale-while-revalidate).
 *
 * - GET  with `?secret=` — used by the daily Vercel Cron job.
 * - POST — used by the in-app "Refresh" button; requires a signed-in admin.
 */

function revalidateAll() {
  for (const tag of ALL_TAGS) revalidateTag(tag, "max");
}

export async function GET(request: NextRequest) {
  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET`; a manual call can
  // pass `?secret=`.
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const secret = request.nextUrl.searchParams.get("secret") ?? bearer;
  const expected = process.env.CRON_SECRET ?? process.env.REVALIDATE_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  revalidateAll();
  return NextResponse.json({ ok: true, revalidated: ALL_TAGS.length, at: Date.now() });
}

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  revalidateAll();
  return NextResponse.json({ ok: true, revalidated: ALL_TAGS.length, at: Date.now() });
}
