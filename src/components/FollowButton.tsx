"use client";

import { useState } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function FollowButton({ 
  targetUserId, 
  isFollowingInitial,
  currentUserId // Added this to catch the prop passed from the profile page
}: { 
  targetUserId: string, 
  isFollowingInitial: boolean,
  currentUserId?: string 
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(isFollowingInitial);
  const [isLoading, setIsLoading] = useState(false);

  // If the user is looking at their own public profile, don't show the follow button
  if (session?.user?.id === targetUserId || currentUserId === targetUserId) {
    return null;
  }

  const toggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      alert("Please sign in to follow users.");
      return router.push("/login");
    }

    if (isLoading) return;

    setIsLoading(true);
    setIsFollowing(!isFollowing); // Optimistic UI update so it feels instant

    try {
      // Pointing to the new API route we created in the last step
      const res = await fetch(`/api/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId })
      });

      if (!res.ok) throw new Error("Failed to toggle follow");
      router.refresh(); // Sync the server data (updates follower counts)
    } catch (error) {
      setIsFollowing(isFollowing); // Revert the button if the server fails
      alert("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFollow}
      disabled={isLoading}
      className={`flex items-center justify-center w-full gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
        isFollowing
          ? "dark:bg-zinc-800 bg-gray-200 dark:text-white text-zinc-900 border dark:border-zinc-700 border-gray-300"
          : "bg-red-600 text-white hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
      }`}
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : isFollowing ? (
        <UserCheck size={18} />
      ) : (
        <UserPlus size={18} />
      )}
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}