import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import noWorkOutLogged from "@/components/ui/noWorkOutLogged.png";

export default async function GreetingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p>Ikke logget ind</p>
      </main>
    );
  }

  // Resolve userId from session or via email lookup
  let userId: string | null = (session.user as any).id ?? null;
  if (!userId && session.user.email) {
    const userByEmail = await db.user.findUnique({ where: { email: session.user.email } });
    userId = userByEmail?.id ?? null;
  }

  // Prepare greeting name
  const userName = session.user.name
    ? session.user.name
    : session.user.email
    ? session.user.email.split("@")[0]
    : "Ven";

  // Latest workout with sets and exercises
  const latestWorkout = userId
    ? await db.workout.findFirst({
        where: { userId },
        orderBy: { date: "desc" },
        include: { sets: { include: { Exercise: true }, orderBy: { orderIndex: "asc" } } },
      })
    : null;

  const latestDateLabel = latestWorkout
    ? new Date(latestWorkout.date).toLocaleDateString("da-DK")
    : null;

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Velkommen {userName}.</h1>
        <div>
          <Link
            href="/workout/today"
            className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-primary-foreground shadow transition hover:bg-primary/90"
          >
            Start træning
          </Link>
        </div>
      </section>

      <section>
        <details className="rounded-xl border border-muted bg-background/70 p-4 shadow-sm">
          <summary className="cursor-pointer select-none font-medium text-foreground">
            {latestWorkout
              ? `Sidste træning – ${latestDateLabel}`
              : "Sidste træning – Ingen træninger endnu"}
          </summary>
          <div className="mt-3 space-y-2">
            {!latestWorkout ? (
              <div className="flex items-center justify-center">
                <Image src={noWorkOutLogged} alt="Ingen træninger endnu" />
              </div>
            ) : latestWorkout.sets.length === 0 ? (
              <p>Ingen øvelser registreret</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {latestWorkout.sets.map((s) => {
                  const parts: string[] = [];
                  if (typeof s.reps === "number") parts.push(`${s.reps} reps`);
                  if (typeof s.weightKg === "number") parts.push(`${s.weightKg} kg`);
                  if (typeof s.rpe === "number") parts.push(`RPE ${s.rpe}`);
                  const meta = parts.length ? ` – ${parts.join(" · ")}` : "";
                  return (
                    <li key={s.id}>
                      {s.Exercise?.name ?? "Ukendt øvelse"}
                      {meta}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </details>
      </section>
    </main>
  );
}
