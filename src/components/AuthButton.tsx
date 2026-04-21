"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        {/* Optional: Display user's name */}
        <span className="text-sm font-medium text-zinc-300">
          {session.user?.name}
        </span>
        
        {/* User's profile image, acts as a dropdown trigger or just decoration */}
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt={session.user.name || "User avatar"}
            width={40}
            height={40}
            className="rounded-full"
          />
        )}

        {/* Sign Out Button */}
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm font-semibold text-white bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-md transition-colors"
    >
      Sign In with Google
    </button>
  );
}