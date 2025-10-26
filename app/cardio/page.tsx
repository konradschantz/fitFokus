import { prisma } from '@/lib/db';
import { getOrCreateUserId } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardioLogger } from '@/components/cardio/cardio-logger';

function suggestedDuration(sessions: Array<{ durationMin: number }>) {
  if (!sessions.length) return 20;
  const avg = sessions.reduce((sum, session) => sum + session.durationMin, 0) / sessions.length;
  if (avg <= 15) return 10;
  if (avg <= 25) return 20;
  return 30;
}

export default async function CardioPage() {
  const userId = await getOrCreateUserId();
  const recent = await prisma.cardioSession.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 3,
  });
  const defaultDuration = suggestedDuration(recent);
  const defaultIntensity = recent.at(0)?.intensity ?? 5;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cykling</CardTitle>
        <p className="text-sm text-muted-foreground">Log varighed og intensitet 1–10. Vi foreslår ud fra dine seneste ture.</p>
      </CardHeader>
      <CardContent>
        <CardioLogger defaultDuration={defaultDuration} defaultIntensity={defaultIntensity} />
      </CardContent>
    </Card>
  );
}
