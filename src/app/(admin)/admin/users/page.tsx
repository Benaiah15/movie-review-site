"use client";

import { useState, useEffect } from "react";
import { Trash2, UserCircle, Loader2, ShieldAlert } from "lucide-react";

export default function ManageUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => { 
        setUsers(data); 
        setIsLoading(false); 
      });
  }, []);

  const handleDelete = async (userId: string, email: string) => {
    if (confirm(`WARNING: Are you absolutely sure you want to permanently delete ${email}? This will wipe their account, reviews, and data.`)) {
      setDeletingId(userId);
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        const errorMessage = await res.text();
        alert(errorMessage || "Failed to delete user.");
      }
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
        <p className="dark:text-zinc-400 text-zinc-500 font-mono text-sm uppercase tracking-widest">Loading User Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-zinc-800 border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm dark:text-zinc-500 text-zinc-500 mt-1">Review, monitor, and moderate registered accounts.</p>
        </div>
        <div className="bg-red-600/10 border border-red-600/20 text-red-600 dark:text-red-500 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold">
          <ShieldAlert size={18} />
          Total Users: {users.length}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-200 dark:border-zinc-800 text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-500">
              <th className="p-4 pl-6">Profile</th>
              <th className="p-4">Contact Data</th>
              <th className="p-4">Gamification</th>
              <th className="p-4">Activity</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors group">
                <td className="p-4 pl-6">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <img src={user.image} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-zinc-800" alt="" />
                    ) : (
                      <UserCircle size={40} className="text-slate-300 dark:text-zinc-700" />
                    )}
                    <span className="font-bold dark:text-white text-slate-900">{user.name || "Unknown Identity"}</span>
                  </div>
                </td>
                <td className="p-4 text-sm font-mono dark:text-zinc-400 text-slate-600">{user.email}</td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-amber-600 dark:text-amber-500">Level {user.level}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-600">{user.xp} XP</span>
                  </div>
                </td>
                <td className="p-4 text-sm font-medium dark:text-zinc-300 text-slate-600">
                  {user._count.reviews} Reviews <span className="mx-1 text-slate-300 dark:text-zinc-700">|</span> {user._count.followers} Followers
                </td>
                <td className="p-4 pr-6 text-right">
                  <button 
                    onClick={() => handleDelete(user.id, user.email)}
                    disabled={deletingId === user.id || user.level === 100}
                    className="p-2.5 text-slate-400 hover:text-white hover:bg-red-600 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                    title={user.level === 100 ? "Master Admin is protected" : "Delete Account"}
                  >
                    {deletingId === user.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}