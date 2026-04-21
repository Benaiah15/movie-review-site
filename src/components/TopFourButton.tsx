"use client";

import { useState } from "react";
import { Pin } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TopFourButton({ movieId, initialIsPinned }: { movieId: string, initialIsPinned: boolean }) {
  const [isPinned, setIsPinned] = useState(initialIsPinned);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const togglePin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/movies/${movieId}/top-four`, {
        method: "POST",
      });
      
      if (res.status === 400) {
        alert("Your Top 4 is already full! You can only have 4 favorites at a time.");
        setIsLoading(false);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setIsPinned(data.pinned);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={togglePin} 
      disabled={isLoading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors font-semibold text-sm shadow-sm ${
        isPinned 
          ? "dark:bg-pink-500/10 bg-pink-50 border dark:border-pink-500/20 border-pink-200 text-pink-600 dark:text-pink-500 dark:hover:bg-pink-500/20 hover:bg-pink-100" 
          : "dark:bg-zinc-900/80 bg-white backdrop-blur border dark:border-zinc-800 border-gray-200 dark:text-zinc-300 text-zinc-600 dark:hover:text-white hover:text-zinc-900 dark:hover:bg-zinc-800 hover:bg-gray-50"
      }`}
    >
      <Pin size={16} className={isPinned ? "fill-pink-600 dark:fill-pink-500" : ""} />
      {isPinned ? "Pinned to Top 4" : "Pin to Top 4"}
    </button>
  );
}