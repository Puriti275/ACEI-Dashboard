import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// On-demand cache busting API route to trigger revalidation of all cached data when a POST request is made to this endpoint with the correct secret.
// This allows us to ensure that our dashboard always shows the most up-to-date data after any changes are made to the underlying Airtable records.

// Post function to trigger revalidation of all cached data by calling revalidateTag with the 'data' tag and return a success message as a JSON response
export async function POST(req: NextRequest) {
    const { tag, secret } = await req.json();

    if (secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ success: false, message: 'Invalid secret' }, { status: 401 });
    }

    revalidateTag('data', { expire: 0});
    return NextResponse.json({ success: true });
}