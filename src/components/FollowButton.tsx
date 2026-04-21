"use client";

import { useState } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function FollowButton({ 
  targetUserId, 
  initialIsFollowing 
}: { 
  targetUserId: string, 
  initialIsFollowing: boolean 
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  // If the user is looking at their own public profile, don't show the follow button
  if (session?.user?.id === targetUserId) {
    return null;
  }

  const toggleFollow = async () => {
    if (!session) {
      alert("Please sign in to follow users.");
      return router.push("/login");
    }

    setIsLoading(true);
    setIsFollowing(!isFollowing); // Optimistic UI update

    try {
      const res = await fetch(`/api/users/${targetUserId}/follow`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to toggle follow");
      router.refresh(); // Sync the server data (updates follower counts)
    } catch (error) {
      setIsFollowing(isFollowing); // Revert if the server fails
      alert("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFollow}
      disabled={isLoading}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
        isFollowing
          ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700"
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