import './globals.css';
import Link from 'next/link';
import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ToastProvider } from '@/components/ui/toast';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { SessionProviderClient } from '@/components/providers/session-provider';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Fit Fokus',
  description: 'Minimalistisk workout-app med fokus på progression',
};

const navItems = [
  { href: '/workout/today', label: 'Dagens træning' },
  { href: '/history', label: 'Historik' },
  { href: '/cardio', label: 'Cardio' },
  { href: '/planner', label: 'Planner' },
  { href: '/exercises', label: 'Øvelser' },
  { href: '/settings', label: 'Indstillinger' },
];

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="da">
      <body className="min-h-screen bg-background text-foreground">
        <SessionProviderClient session={session}>
          <ToastProvider>
            <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6">
              <header className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-muted bg-white/80 p-4 shadow-sm">
                <Link href={session ? "/greeting" : "/"} className="text-lg font-semibold tracking-tight">
                  Fit Fokus
                </Link>
                <nav className="flex flex-wrap gap-2 text-sm">
                  {session ? (
                    navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                        )}
                      >
                        {item.label}
                      </Link>
                    ))
                  ) : (
                  <span className="inline-flex items-center justify-center p-1" aria-hidden="true">
                    <img src="/favicon.svg" alt="Fit Fokus" className="h-6 w-6" />
                  </span>
                )}
              </nav>
              </header>
              <main className="flex-1">{children}</main>
            </div>
          </ToastProvider>
        </SessionProviderClient>
      </body>
    </html>
  );
}
