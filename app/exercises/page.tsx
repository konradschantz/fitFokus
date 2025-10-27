import { prisma } from '@/lib/db';
import { ExerciseCarousels } from '@/components/exercises/exercise-carousels';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ExercisesPage() {
  const exercises = await prisma.exercise.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Øvelser</CardTitle>
          <p className="text-sm text-muted-foreground">Gennemse øvelser opdelt i Ben og Overkrop.</p>
        </CardHeader>
      </Card>
      <ExerciseCarousels
        exercises={exercises.map((exercise) => ({
          id: exercise.id,
          name: exercise.name,
          category: exercise.category,
          equipment: exercise.equipment,
          primaryMuscle: exercise.primaryMuscle,
        }))}
      />
    </div>
  );
}
export const dynamic = 'force-dynamic';
