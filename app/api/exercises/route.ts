import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const exercises = await prisma.exercise.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(exercises);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Kunne ikke hente øvelser' }, { status: 500 });
  }
}
