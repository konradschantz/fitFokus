import { getServerSession } from "next-auth";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export default async function Dashboard() {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { plan: true },
  });

  return (
    <main className="p-6 space-y-2">
      <h1 className="text-2xl font-bold">
        Hej{user?.name ? `, ${user.name}` : ""} 👋
      </h1>
      <p>Din bruger-id: {session.user.id}</p>
      <p>Aktiv plan: {user?.plan?.name ?? "Ingen valgt endnu"}</p>
    </main>
  );
}
