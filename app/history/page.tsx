import { prisma } from '@/lib/db';
import { getOrCreateUserId } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TinyChart } from '@/components/history/tiny-chart';
import { getProgress } from '@/lib/progress';

export default async function HistoryPage() {
  const userId = await getOrCreateUserId();
  const workouts = await prisma.workout.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 10,
    include: { sets: true },
  });
  const progress = await getProgress(userId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seneste træninger</CardTitle>
          <p className="text-sm text-muted-foreground">Hold øje med volumen og 1RM-trend.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {workouts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen registrerede workouts endnu.</p>
          ) : (
            workouts.map((workout) => {
              const totalVolume = workout.sets.reduce((sum, set) => sum + (set.weightKg ?? 0) * (set.reps ?? 0), 0);
              const completedSets = workout.sets.filter((set) => set.completed).length;
              return (
                <div
                  key={workout.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-muted bg-white/70 p-4 shadow-sm"
                >
                  <div>
                    <p className="font-semibold">{formatDate(new Date(workout.date))}</p>
                    <p className="text-xs text-muted-foreground">
                      {workout.planType.replaceAll('_', ' ')} • {completedSets}/{workout.sets.length} sæt
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Total volume</p>
                    <p className="text-lg font-semibold tabular-nums">{Math.round(totalVolume)} kg</p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>1RM-estimat (Epley)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {progress.oneRepMaxTrends.map((trend) => (
            <div key={trend.lift} className="flex flex-col gap-2 rounded-xl border border-muted bg-white/70 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{trend.lift}</p>
                <p className="text-xs text-muted-foreground">
                  {trend.points.length ? `${trend.points.at(-1)?.value?.toFixed(1)} kg` : 'Ingen data'}
                </p>
              </div>
              <TinyChart points={trend.points.map((point) => ({ label: point.date, value: point.value }))} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
