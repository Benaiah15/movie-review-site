"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="px-4 py-2 text-sm font-semibold border border-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-900 transition"
    >
      Sign Out
    </button>
  );
}