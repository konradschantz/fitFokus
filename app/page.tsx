// app/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/greeting");

  return (
    <main className="mx-auto max-w-md p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Velkommen til FitFokus</h1>
        <p className="text-base sm:text-sm text-muted-foreground">
          Log ind for at se din dags træning, historik og indstillinger.
        </p>
      </div>
      <a
        href="/api/auth/signin?callbackUrl=%2Fgreeting"
        className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-5 text-base font-medium text-primary-foreground transition hover:bg-primary/90 sm:text-sm"
      >
        Log ind med Google
      </a>
    </main>
  );
}
