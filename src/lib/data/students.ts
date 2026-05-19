import { unstable_cache, revalidateTag } from 'next/cache';
import { base } from '../airtable';

// Define the Student type based on the fields in the Airtable base
export type Student = {
    id: string;
    Name: string;
    UTK_Email: string;
    Graduation: string;
    Major: string;
    Race: string;
    Gender: string;
}

// Fetch students from Airtable and return them as an array of Student objects
const fetchStudents = async (): Promise<Student[]> => {
    const records = await base('Student Profiles').select({
        fields: ['Name', 'UTK Email', 'Graduation', 'Major', 'Race', 'Gender'],
        view: 'Current Students'
    }).all();

    return records.map(record => ({
        id: record.getId(),
        Name: record.get('Name') as string,
        UTK_Email: record.get('UTK Email') as string,
        Graduation: record.get('Graduation') as string,
        Major: record.get('Major') as string,
        Race: record.get('Race') as string,
        Gender: record.get('Gender') as string
    }));
}

// Cache the result of fetchStudents and set it to revalidate every 300 seconds (5 minutes) or when the 'students' tag is invalidated
export const getStudents = unstable_cache(
    fetchStudents,
    ['students'],
    { revalidate: 300, tags: ['students'] }
);

// Write operations --> create a student (note that this invalidates the student tag)
export async function createStudent(data: Omit<Student, 'id'>) {
    const record = await base('Student Profiles').create({
        Name: data.Name,
        'UTK Email': data.UTK_Email,
        Graduation: data.Graduation,
        Major: data.Major,
        Race: data.Race,
        Gender: data.Gender
    });
    revalidateTag('students', {expire: 0}); // Invalidate the 'students' tag to trigger a cache refresh
    return record.getId();
}

// Write operations --> update a student (note that this invalidates the student tag)
export async function updateStudent(id: string, patch: Partial<Omit<Student, 'id'>>) {
    const record = await base('Student Profiles').update(id, {
        'Name': patch.Name,
        'UTK Email': patch.UTK_Email,
        'Graduation': patch.Graduation,
        'Major': patch.Major,
        'Race': patch.Race,
        'Gender': patch.Gender
    });

    revalidateTag('students', {expire: 0}); // Invalidate the 'students' tag to trigger a cache refresh
    return record.getId();
}