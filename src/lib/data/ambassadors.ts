import { unstable_cache, revalidateTag } from 'next/cache';
import { base } from '../airtable';

// Define the Ambassador type based on the fields in the Airtable base
export type Ambassador = {
    id: string;
    Activity_Tracking: string;
    Ambassador_Name: string;
    Activity: string;
    Date: string;
    Duration: string;
    Location: string;
    Number_of_Students_Interacted_With: string;
    Notes: string;
}

// Fetch ambassadors from Airtable and return them as an array of Ambassador objects
const fetchAmbassadors = async (): Promise<Ambassador[]> => {
    const records = await base('Ambassador Tracking').select({
        fields: ['Activity Tracking', 'Ambassador Name', 'Actiity', 'Date', 'Duration', 'Location',
            '# of Students Interacted With', 'Notes'],
        view: 'Grid view'
    }).all();

    return records.map(record => ({
        id: record.getId(),
        Activity_Tracking: record.get('Activity Tracking') as string,
        Ambassador_Name: record.get('Ambassador Name') as string,
        Activity: record.get('Activity') as string,
        Date: record.get('Date') as string,
        Duration: record.get('Duration') as string,
        Location: record.get('Location') as string,
        Number_of_Students_Interacted_With: record.get('# of Students Interacted With') as string,
        Notes: record.get('Notes') as string
    }));
}

// Cache the result of fetchAmbassadors and set it to revalidate every 300 seconds (5 minutes) or when the 'ambassadors' tag is invalidated
export const getAmbassadors = unstable_cache(
    fetchAmbassadors,
    ['ambassadors'],
    { revalidate: 300, tags: ['ambassadors']}
)

// Write operations --> create an ambassador activity (note that this invalidates the ambassadors tag)
export async function createAmbassador(data: Omit<Ambassador, 'id'>) {
    const record = await base('Ambassador Tracking').create({
        'Activity Tracking': data.Activity_Tracking,
        'Ambassador Name': data.Ambassador_Name,
        'Activity': data.Activity,
        'Date': data.Date,
        'Duration': data.Duration,
        'Location': data.Location,
        '# of Students Interacted With': data.Number_of_Students_Interacted_With,
        'Notes': data.Notes
    });
    revalidateTag('ambassadors', {expire: 0});
    return record.getId();
}

// Write operations --> update an ambassador activity (note that this invalidates the ambassadors tag)
export async function updateAmbassador(id: string, patch: Partial<Omit<Ambassador, 'id'>>) {
    const record = await base('Ambassador Tracking').update(id, {
        'Activity Tracking': patch.Activity_Tracking,
        'Ambassador Name': patch.Ambassador_Name,
        'Activity': patch.Activity,
        'Date': patch.Date,
        'Duration': patch.Duration,
        'Location': patch.Location,
        '# of Students Interacted With': patch.Number_of_Students_Interacted_With,
        'Notes': patch.Notes
    });

    revalidateTag('ambassadors', {expire: 0});
    return record.getId();
}