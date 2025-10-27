"use client";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/greeting");
    }
  }, [status, router]);
  return (
    <main className="mx-auto max-w-sm p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Log ind</h1>
      <p className="text-sm opacity-80">Brug din Google-konto for at fortsætte.</p>
      <button
        className="rounded px-4 py-2 bg-primary text-primary-foreground transition hover:bg-primary/90"
        onClick={() => signIn("google", { callbackUrl: "/greeting" })}
      >
        Log ind med Google
      </button>
    </main>
  );
}
