import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
.base(process.env.AIRTABLE_BASE_ID!);

// Fetch from student view
const studentRecords = await base('Student Profiles').select({
    view: 'Current Students',
    fields: ['Name', 'UTK Email', 'Graduation', 'Major', 'Race', 'Gender']
}).all();

// Fetch from events view
const eventRecords = await base('Events & Competitions').select({
    view: 'Grid view',
    fields: ['Event', 'Semester', 'Event Name', 'Date', 'Time', 'Location', 'Speakers & Judges',
        'Internal/External',]
}).all()





export { base, studentRecords };