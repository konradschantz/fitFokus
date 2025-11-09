import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MealsOverviewPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Måltidsoverblik</CardTitle>
          <p className="text-sm text-muted-foreground">
            Her kan du snart få overblik over dine planlagte måltider og forslag skræddersyet til din træning.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Funktionaliteten er på vej, men du kan allerede nu udforske vores planlægningsværktøjer og sætte dine præferencer.
          </p>
          <Link
            href="/planner"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Gå til planner
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
