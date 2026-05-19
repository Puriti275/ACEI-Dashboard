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

// Fetch from coaching interactions view
const coachingRecords = await base('Interactions- Student & Mentors').select({
    view: 'All Records',
    fields: ['Interaction', 'Entrepreneur', 'Company', 'Date', 'Time', 'Duration', 'Type of Interaction',
        'Topic', 'ACEI Member', 'Notes']
    }).all()

// Fetch from ambassador tracking view
const ambassadorRecords = await base('Ambassador Tracking').select({
    view: 'Grid view',
    fields: ['Activity Tracking', 'Ambassador Name', 'Actiity', 'Date', 'Duration', 'Location',
        '# of Students Interacted With', 'Notes']
}).all()

export { base, studentRecords, eventRecords, coachingRecords, ambassadorRecords };