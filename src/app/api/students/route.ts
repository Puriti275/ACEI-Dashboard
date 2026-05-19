import { NextRequest, NextResponse } from 'next/server';
import { getStudents, createStudent, updateStudent } from '../../../lib/data/students';

// Get function to fetch all students and return them as a JSON response
export async function GET(req: NextRequest) {
    const students = await getStudents();
    return NextResponse.json(students);
}

// Post function to create a new student using the createStudent function and return the new student's ID as a JSON response
export async function POST(req: NextRequest) {
    const data = await req.json();
    const id = await createStudent(data);
    return NextResponse.json({ id });
}

// Patch function to update an existing student using the updateStudent function and return a success message as a JSON response
export async function PATCH(req: NextRequest) {
    const { id, ...patch } = await req.json();
    await updateStudent(id, patch);
    return NextResponse.json({ success: true });
}