import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const s = (await getServerSession(authOptions)) as { user?: { id?: string | null } } | null;
  const userId = s?.user?.id ?? null;
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { plan: true },
  });

  return (
    <main className="p-6 space-y-2">
      <h1 className="text-2xl font-bold">
        Hej{user?.name ? `, ${user.name}` : ""} 👋
      </h1>
      <p>Din bruger-id: {userId}</p>
      <p>Aktiv plan: {user?.plan?.name ?? "Ingen valgt endnu"}</p>
    </main>
  );
}
