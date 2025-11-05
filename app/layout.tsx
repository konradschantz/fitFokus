import './globals.css';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/toast';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { SessionProviderClient } from '@/components/providers/session-provider';
import HeaderActions from '@/components/header/header-actions';
import { ScreenWakeLock } from '@/components/providers/screen-wake-lock';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Fit Fokus',
  description: 'Minimalistisk workout-app med fokus pa progression',
};

const navItems = [
  { href: '/workout/today?select=1', label: 'Dagens traening' },
  { href: '/history', label: 'Historik' },
  { href: '/exercises', label: 'Oevelser' },
  { href: '/settings', label: 'Indstillinger' },
];

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="da" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{try{const stored=localStorage.getItem('theme');const prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;const theme=stored?JSON.parse(stored):(prefersDark?'dark':'light');const root=document.documentElement;const body=document.body;if(theme==='dark'){root.classList.add('dark');root.style.colorScheme='dark';if(body)body.style.colorScheme='dark';}else{root.classList.remove('dark');root.style.colorScheme='light';if(body)body.style.colorScheme='light';}}catch(error){console.warn('Failed to hydrate theme',error);}})();`
          }}
        />
        <SessionProviderClient session={session}>
          <ToastProvider>
            <ScreenWakeLock />
            <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6">
              <header className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-muted bg-background/80 p-4 text-foreground shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center p-1" aria-hidden="true">
                    <Image src="/favicon.svg" alt="Fit Fokus" width={24} height={24} className="h-6 w-6" />
                  </span>
                  <Link href={session ? '/greeting' : '/'} className="text-lg font-semibold tracking-tight text-foreground">
                    Fit Fokus
                  </Link>
                </div>
                <HeaderActions items={navItems} isAuthed={Boolean(session)} />
              </header>
              <main className="flex-1">{children}</main>
            </div>
          </ToastProvider>
        </SessionProviderClient>
      </body>
    </html>
  );
}
