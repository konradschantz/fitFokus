import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import startWorkoutImg from "@/components/ui/StartWorkout.png";

export default async function GreetingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p>Ikke logget ind</p>
      </main>
    );
  }

  const userName = session.user.name
    ? session.user.name
    : session.user.email
    ? session.user.email.split("@")[0]
    : "Ven";

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Velkommen {userName}.</h1>
        <Link
          href="/workout/today"
          className="block group rounded-2xl overflow-hidden border border-muted shadow-sm relative"
        >
          <Image src={startWorkoutImg} alt="Start træning" priority className="h-auto w-full" />
          <div className="absolute inset-0 grid place-items-center">
            <span className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-lg ring-1 ring-primary/30 backdrop-blur-md transition-transform duration-150 group-hover:scale-105">
              Start træning
            </span>
          </div>
        </Link>
      </section>
    </main>
  );
}

