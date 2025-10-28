"use client";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      className="rounded px-3 py-2 bg-muted text-foreground transition-colors hover:bg-muted/80"
      onClick={() => signOut({ callbackUrl: '/login' })}
    >
      Log ud
    </button>
  );
}
