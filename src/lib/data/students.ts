import { unstable_cache, revalidateTag } from 'next/cache';
import { base } from '../airtable';

export type Student = {
    Name: string;
    UTK_Email: string;
    Graduation: string;
    Major: string;
    Race: string;
    Gender: string;
}

const fetchStudents = async (): Promise<Student[]> => {
    const records = await base('Student Profiles').select({
        fields: ['Name', 'UTK Email', 'Graduation', 'Major', 'Race', 'Gender'],
        view: 'Current Students'
    }).all();

    return records.map(record => ({
        Name: record.get('Name') as string,
        UTK_Email: record.get('UTK Email') as string,
        Graduation: record.get('Graduation') as string,
        Major: record.get('Major') as string,
        Race: record.get('Race') as string,
        Gender: record.get('Gender') as string
    }));
}

export const getstudents = unstable_cache(
    fetchStudents,
    ['students'],
    { revalidate: 300, tags: ['students'] }
);

