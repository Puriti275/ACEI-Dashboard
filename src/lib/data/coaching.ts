import { unstable_cache, revalidateTag } from "next/cache";
import { base } from "../airtable";

// Define the Event type based on the fields in the Airtable base
export type Event = {
    id: string;
    Interaction: string;
    Entrepreneur: string;
    Company: string;
    Date: string;
    Time: string;
    Duration: string;
    Type_of_Interaction: string;
    Topic: string;
    ACEI_Member: string;
    Notes: string;
}

// Fetch coaching interactions from Airtable and return them as an array of Event objects
const fetchCoaching = async (): Promise<Event[]> => {
    const records = await base('Interactions- Student & Mentors').select({
        fields: ['Interaction', 'Entrepreneur', 'Company', 'Date', 'Time', 'Duration', 'Type of Interaction',
            'Topic', 'ACEI Member', 'Notes'],
        view: 'All Records'
    }).all();

    return records.map(record => ({
        id: record.getId(),
        Interaction: record.get('Interaction') as string,
        Entrepreneur: record.get('Entrepreneur') as string,
        Company: record.get('Company') as string,
        Date: record.get('Date') as string,
        Time: record.get('Time') as string,
        Duration: record.get('Duration') as string,
        Type_of_Interaction: record.get('Type of Interaction') as string,
        Topic: record.get('Topic') as string,
        ACEI_Member: record.get('ACEI Member') as string,
        Notes: record.get('Notes') as string
    }));
}

// Cache the result of fetchCoaching and set it to revalidate every 300 seconds (5 minutes) or when the 'coaching' tag is invalidated
export const getCoaching = unstable_cache(
    fetchCoaching,
    ['coaching'],
    { revalidate: 300, tags: ['coaching']}
)

// Write operations --> create a coaching interaction (note that this invalidates the coaching tag)
export async function createCoaching(data: Omit<Event, 'id'>) {
    const record = await base('Interactions- Student & Mentors').create({
        'Interaction': data.Interaction,
        'Entrepreneur': data.Entrepreneur,
        'Company': data.Company,
        'Date': data.Date,
        'Time': data.Time,
        'Duration': data.Duration,
        'Type of Interaction': data.Type_of_Interaction,
        'Topic': data.Topic,
        'ACEI Member': data.ACEI_Member,
        'Notes': data.Notes
    });
    revalidateTag('coaching', {expire: 0});
    return record.getId();
}

// Write operations --> update a coaching interaction (note that this invalidates the coaching tag)
export async function updateCoaching(id: string, patch: Partial<Omit<Event, 'id'>>) {
    const record = await base('Interactions- Student & Mentors').update(id, {
        'Interaction': patch.Interaction,
        'Entrepreneur': patch.Entrepreneur,
        'Company': patch.Company,
        'Date': patch.Date,
        'Time': patch.Time,
        'Duration': patch.Duration,
        'Type of Interaction': patch.Type_of_Interaction,
        'Topic': patch.Topic,
        'ACEI Member': patch.ACEI_Member,
        'Notes': patch.Notes
    });

    revalidateTag('coaching', {expire: 0});
    return record.getId();
}