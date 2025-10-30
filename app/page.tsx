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
        href="/api/auth/signin/google?callbackUrl=%2Fgreeting"
        className="inline-flex h-12 items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-5 text-base font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 sm:text-sm"
        aria-label="Log ind med Google"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.907 31.978 29.333 35 24 35c-7.18 0-13-5.82-13-13s5.82-13 13-13c3.315 0 6.332 1.237 8.641 3.259l5.657-5.657C34.676 3.053 29.614 1 24 1 10.745 1 0 11.745 0 25s10.745 24 24 24c12.426 0 23-9.067 23-24 0-1.604-.172-3.165-.389-4.917z"/>
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.814C14.327 16.229 18.813 13 24 13c3.315 0 6.332 1.237 8.641 3.259l5.657-5.657C34.676 3.053 29.614 1 24 1 15.318 1 7.798 5.691 3.479 12.309l2.827 2.382z"/>
          <path fill="#4CAF50" d="M24 49c5.258 0 10.06-1.807 13.8-4.889l-6.387-5.414C29.146 40.86 26.686 41.7 24 41.7c-5.279 0-9.757-3.405-11.387-8.129l-6.47 4.985C9.44 44.607 16.21 49 24 49z"/>
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.1 3.023-3.535 5.363-6.49 6.697l6.387 5.414C37.532 42.229 42.5 38 42.5 25c0-1.604-.172-3.165-.389-4.917z"/>
        </svg>
        <span>Log ind med Google</span>
      </a>
    </main>
  );
}
