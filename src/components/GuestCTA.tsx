"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";

export default function GuestCTA() {
  const { data: session, status } = useSession();

  // If loading or if the user is already logged in, show nothing
  if (status === "loading" || session) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 mt-32 text-center dark:bg-gradient-to-t bg-gradient-to-t dark:from-red-950/20 from-red-50 to-transparent border-t dark:border-red-900/30 border-red-200 pt-20 rounded-t-[3rem] transition-colors duration-300">
      <h2 className="text-4xl md:text-5xl font-black dark:text-white text-zinc-900 mb-6 tracking-tight transition-colors">
        Ready to start your diary?
      </h2>
      <Link prefetch={false} href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all hover:scale-105 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
        Join MovieSpace Free <ChevronRight size={20} />
      </Link>
    </div>
  );
}