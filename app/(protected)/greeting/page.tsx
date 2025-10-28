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
        <Link href="/workout/today" className="block group rounded-2xl overflow-hidden border border-muted shadow-sm">
          <Image
            src={startWorkoutImg}
            alt="Start træning"
            priority
            className="h-auto w-full transition-transform duration-200 group-hover:scale-[1.01]"
          />
        </Link>
      </section>
    </main>
  );
}

