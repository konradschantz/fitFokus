import { prisma } from '@/lib/db';
import { getOrCreateUserId } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsClient } from '@/components/settings/settings-client';

export default async function SettingsPage() {
  const userId = await getOrCreateUserId();
  const settings = await prisma.userSettings.findUnique({ where: { userId } });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Indstillinger</CardTitle>
        <p className="text-sm text-muted-foreground">Tilpas mål, frekvens og udstyr. Eksportér eller slet data.</p>
      </CardHeader>
      <CardContent>
        <SettingsClient
          initialGoal={settings?.goal}
          initialDaysPerWeek={settings?.daysPerWeek}
          initialEquipment={settings?.equipmentProfile}
        />
      </CardContent>
    </Card>
  );
}
