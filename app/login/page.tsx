"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-sm p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Log ind</h1>
      <p className="text-sm opacity-80">Brug din Google-konto for at fortsætte.</p>
      <button
        className="rounded px-4 py-2 bg-blue-600 text-white"
        onClick={() => signIn("google")}
      >
        Log ind med Google
      </button>
    </main>
  );
}
