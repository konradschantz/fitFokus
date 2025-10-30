"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string };

export default function ClientNav({ items, isAuthed }: { items: Item[]; isAuthed: boolean }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  if (!isAuthed || isLogin) return null;
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

