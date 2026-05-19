import { unstable_cache, revalidateTag } from "next/cache";
import { base } from "../airtable";

// Define the Event type based on the fields in the Airtable base
export type Event = {
    Event: string;
    Semester: string;
    Event_Name: string;
    Date: string;
    Time: string;
    Location: string;
    Speakers_Judges: string;
    Internal_External: string;
}

// Fetch events from Airtable and return them as an array of Event objects
const fetchEvents = async (): Promise<Event[]> => {
    const records = await base('Events & Competitions').select({
        fields: ['Event', 'Semester', 'Event Name', 'Date', 'Time', 'Location', 'Speakers & Judges',
            'Internal/External',],
        view: 'Grid view'
    }).all();

    return records.map(record => ({
        Event: record.get('Event') as string,
        Semester: record.get('Semester') as string,
        Event_Name: record.get('Event Name') as string,
        Date: record.get('Date') as string,
        Time: record.get('Time') as string,
        Location: record.get('Location') as string,
        Speakers_Judges: record.get('Speakers & Judges') as string,
        Internal_External: record.get('Internal/External') as string
    }));
}

// Cache the result of fetchEvents and set it to revalidate every 300 seconds (5 minutes) or when the 'events' tag is invalidated
export const getEvents = unstable_cache(
    fetchEvents,
    ['events'],
    { revalidate: 300, tags: ['events']}
)

// Write operations --> create an event (note that this invalidates the events tag)
export async function createEvent(data: Omit<Event, 'id'>) {
    const record = await base('Events & Competitions').create({
        'Event': data.Event,
        'Semester': data.Semester,
        'Event Name': data.Event_Name,
        'Date': data.Date,
        'Time': data.Time,
        'Location': data.Location,
        'Speakers & Judges': data.Speakers_Judges,
        'Internal/External': data.Internal_External
    });
    revalidateTag('events', {expire: 0});
    return record.getId();
}

// Write operations --> update an event (note that this invalidates the events tag)
export async function updateEvent(id: string, patch: Partial<Omit<Event, 'id'>>) {
    const record = await base('Events & Competitions').update(id, {
        'Event': patch.Event,
        'Semester': patch.Semester,
        'Event Name': patch.Event_Name,
        'Date': patch.Date,
        'Time': patch.Time,
        'Location': patch.Location,
        'Speakers & Judges': patch.Speakers_Judges,
        'Internal/External': patch.Internal_External
    })
    revalidateTag('events', {expire: 0});
    return record.getId();
}