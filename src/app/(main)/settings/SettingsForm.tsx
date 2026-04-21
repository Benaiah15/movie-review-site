"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsForm({ initialName, initialBio }: { initialName: string, initialBio: string }) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-bold dark:text-zinc-400 text-zinc-600">Display Name</label>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full dark:bg-zinc-950 bg-gray-50 border dark:border-zinc-800 border-gray-300 dark:text-white text-zinc-900 px-4 py-3 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold dark:text-zinc-400 text-zinc-600">Bio</label>
        <textarea 
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="w-full dark:bg-zinc-950 bg-gray-50 border dark:border-zinc-800 border-gray-300 dark:text-white text-zinc-900 px-4 py-3 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors resize-none" 
        />
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black px-8 py-3 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
        >
          <Save size={20} /> {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}