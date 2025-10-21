import { prisma } from '@/lib/db';
import { getOrCreateUserId } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlannerClient } from '@/components/planner/planner-client';

export default async function PlannerPage() {
  const userId = getOrCreateUserId();
  const settings = await prisma.userSettings.findUnique({ where: { userId } });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planner</CardTitle>
        <p className="text-sm text-muted-foreground">Vælg målsætning, frekvens og udstyr. Vi foreslår automatisk næste plan.</p>
      </CardHeader>
      <CardContent>
        <PlannerClient
          initialGoal={settings?.goal}
          initialDaysPerWeek={settings?.daysPerWeek}
          initialEquipment={settings?.equipmentProfile}
        />
      </CardContent>
    </Card>
  );
}
