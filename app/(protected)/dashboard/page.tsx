import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

type SessionUserWithId = Session["user"] & { id?: string };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUserWithId | undefined)?.id;
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
