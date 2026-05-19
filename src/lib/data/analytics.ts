import { unstable_cache } from 'next/cache';
import { getStudents } from './students';
import { getEvents } from './events';
import { getCoaching } from './coaching';
import { getAmbassadors } from './ambassadors';

export const getDashboardStudentStats = unstable_cache(
    async () => {
        const students = await getStudents();
        return {
            total: students.length,
            //we'll see how we feel about the byMajor; don't really know what's going on here
            byMajor: students.reduce((acc, student) => {
                acc[student.Major] = (acc[student.Major] || 0) + 1;
                return acc;
            }, {} as Record<string, number>),
            byRace: Object.groupBy(students, s => s.Race),
            byGender: Object.groupBy(students, s => s.Gender)
        };
    },
    ['dashboard-student-stats'],
    { revalidate: 300, tags: ['dashboard-student-stats'] }
);

export const getDashboardEventStats = unstable_cache(
    async () => {
        const events = await getEvents();
        return {
            total: events.length,
            bySemester: events.reduce((acc, event) => {
                acc[event.Semester] = (acc[event.Semester] || 0) + 1;
                return acc;
            }, {} as Record<string, number>),
            byLocation: Object.groupBy(events, e => e.Location),
            bySpeakersJudges: Object.groupBy(events, e => e.Speakers_Judges),
            byInternalExternal: Object.groupBy(events, e => e.Internal_External)
        };
    },
    ['dashboard-event-stats'],
    { revalidate: 300, tags: ['dashboard-event-stats'] }
);

export const getDashboardCoachingStats = unstable_cache(
    async () => {
        const coaching = await getCoaching();
        return {
            total: coaching.length,
            byTypeOfInteraction: Object.groupBy(coaching, c => c.Type_of_Interaction),
            byTopic: Object.groupBy(coaching, c => c.Topic),
            byACEIMember: Object.groupBy(coaching, c => c.ACEI_Member),
        };
    },
    ['dashboard-coaching-stats'],
    { revalidate: 300, tags: ['dashboard-coaching-stats'] }
);

export const getDashboardAmbassadorStats = unstable_cache(
    async () => {
        const ambassadors = await getAmbassadors();
        return {
            total: ambassadors.length,
            byActivity: Object.groupBy(ambassadors, a => a.Activity),
            byLocation: Object.groupBy(ambassadors, a => a.Location),
        };
    },
    ['dashboard-ambassador-stats'],
    { revalidate: 300, tags: ['dashboard-ambassador-stats'] }
);