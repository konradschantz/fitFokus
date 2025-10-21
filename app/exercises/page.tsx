import { prisma } from '@/lib/db';
import { ExerciseBrowser } from '@/components/exercises/exercise-browser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ExercisesPage() {
  const exercises = await prisma.exercise.findMany({ orderBy: { name: 'asc' } });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Øvelser</CardTitle>
        <p className="text-sm text-muted-foreground">Søg og marker favoritter for hurtig adgang.</p>
      </CardHeader>
      <CardContent>
        <ExerciseBrowser
          exercises={exercises.map((exercise) => ({
            id: exercise.id,
            name: exercise.name,
            category: exercise.category,
            equipment: exercise.equipment,
            metric: exercise.metric,
          }))}
        />
      </CardContent>
    </Card>
  );
}
export const dynamic = 'force-dynamic';
