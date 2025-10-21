export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getOrCreateUserId } from '@/lib/auth';
import { getProgress } from '@/lib/progress';

export async function GET() {
  try {
    const userId = getOrCreateUserId();
    const data = await getProgress(userId);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Kunne ikke hente progression' }, { status: 500 });
  }
}
 
