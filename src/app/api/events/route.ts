import { NextRequest, NextResponse } from 'next/server';
import { getEvents, createEvent, updateEvent } from '../../../lib/data/events';

// Get function to fetch all events and return them as a JSON response
export async function GET(req: NextRequest) {
    const events = await getEvents();
    return NextResponse.json(events);
}

// Post function to create a new event using the createEvent function and return the new event's ID as a JSON response
export async function POST(req: NextRequest) {
    const data = await req.json();
    const id = await createEvent(data);
    return NextResponse.json({ id });
}

// Patch function to update an existing event using the updateEvent function and return a success message as a JSON response
export async function PATCH(req: NextRequest) {
    const { id, ...patch } = await req.json();
    await updateEvent(id, patch);
    return NextResponse.json({ success: true });
}