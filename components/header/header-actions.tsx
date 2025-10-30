"use client";
import ThemeToggle from "@/components/theme-toggle";
import ClientNav from "@/components/header/client-nav";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string };

export default function HeaderActions({ items, isAuthed }: { items: Item[]; isAuthed: boolean }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  if (isLogin) return null; // Hide entire right-side bar on login page
  return (
    <div className="flex items-center gap-2">
      <ClientNav items={items} isAuthed={isAuthed} />
      <div className="ml-2">
        <ThemeToggle />
      </div>
    </div>
  );
}

