"use client";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button className="px-3 py-2 rounded bg-gray-200" onClick={() => signOut()}>
      Log ud
    </button>
  );
}
