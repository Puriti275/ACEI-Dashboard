import { NextRequest, NextResponse } from 'next/server';
import { getAmbassadors, createAmbassador, updateAmbassador } from '../../../lib/data/ambassadors';

// Get function to fetch all ambassador activities and return them as a JSON response
export async function GET(req: NextRequest) {
    const ambassadors = await getAmbassadors();
    return NextResponse.json(ambassadors);
}

// Post function to create a new ambassador activity using the createAmbassador function and return the new activity's ID as a JSON response
export async function POST(req: NextRequest) {
    const data = await req.json();
    const id = await createAmbassador(data);
    return NextResponse.json({ id });
}

// Patch function to update an existing ambassador activity using the updateAmbassador function and return a success message as a JSON response
export async function PATCH(req: NextRequest) {
    const { id, ...patch } = await req.json();
    await updateAmbassador(id, patch);
    return NextResponse.json({ success: true });
}