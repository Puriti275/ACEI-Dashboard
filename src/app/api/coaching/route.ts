import { NextRequest, NextResponse } from 'next/server';
import { getCoaching, createCoaching, updateCoaching } from '../../../lib/data/coaching';

// Get function to fetch all coaching interactions and return them as a JSON response
export async function GET(req: NextRequest) {
    const coaching = await getCoaching();
    return NextResponse.json(coaching);
}

// Post function to create a new coaching interaction using the createCoaching function and return the new interaction's ID as a JSON response
export async function POST(req: NextRequest) {
    const data = await req.json();
    const id = await createCoaching(data);
    return NextResponse.json({ id });
}

// Patch function to update an existing coaching interaction using the updateCoaching function and return a success message as a JSON response
export async function PATCH(req: NextRequest) {
    const { id, ...patch } = await req.json();
    await updateCoaching(id, patch);
    return NextResponse.json({ success: true });
}