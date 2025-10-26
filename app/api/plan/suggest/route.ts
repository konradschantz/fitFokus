export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getOrCreateUserId } from '@/lib/auth';
import { suggestNextWorkout } from '@/lib/plan';

export async function POST() {
  try {
    const userId = await getOrCreateUserId();
    const plan = await suggestNextWorkout(userId);
    return NextResponse.json(plan);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Kunne ikke foreslå workout' }, { status: 500 });
  }
}
 
