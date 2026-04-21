"use client";

import { useState } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function WatchlistButton({ movieId, initialIsSaved }: { movieId: string, initialIsSaved: boolean }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);

  const toggleWatchlist = async () => {
    if (!session) {
      alert("Please sign in to save movies to your watchlist.");
      return router.push("/login");
    }

    setIsLoading(true);
    setIsSaved(!isSaved); // Optimistic UI update

    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId }),
      });

      if (!res.ok) throw new Error("Failed to toggle watchlist");
      router.refresh(); 
    } catch (error) {
      setIsSaved(isSaved); // Revert if the server fails
      alert("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWatchlist}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all border shadow-sm ${
        isSaved
          ? "dark:bg-amber-500/10 bg-amber-50 dark:text-amber-500 text-amber-600 dark:border-amber-500/20 border-amber-200 dark:hover:bg-amber-500/20 hover:bg-amber-100"
          : "dark:bg-zinc-900/80 bg-white dark:text-white text-zinc-900 dark:border-zinc-800 border-gray-200 dark:hover:bg-zinc-800 hover:bg-gray-50 backdrop-blur"
      }`}
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Bookmark size={18} className={isSaved ? "fill-amber-500 text-amber-500" : "dark:text-zinc-400 text-zinc-500"} />
      )}
      {isSaved ? "Saved to Watchlist" : "Add to Watchlist"}
    </button>
  );
}