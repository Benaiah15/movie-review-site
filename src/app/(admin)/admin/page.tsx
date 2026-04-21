import { Film, Users, Star } from "lucide-react";
import Link from "next/link";
import db from "@/lib/db";

// Force dynamic rendering so stats are always up to date
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // Fetch real-time stats from your database
  const movieCount = await db.movie.count();
  const userCount = await db.user.count();
  const reviewCount = await db.review.count();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">
          Dashboard Overview
        </h1>
        <p className="text-slate-500 dark:text-zinc-400 mt-2 transition-colors">
          Welcome back to the MovieSpace command center.
        </p>
      </header>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 rounded-lg transition-colors flex-shrink-0">
              <Film size={24} />
            </div>
            <div className="overflow-hidden min-w-0">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 truncate transition-colors">Total Movies</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white truncate transition-colors">{movieCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 rounded-lg transition-colors flex-shrink-0">
              <Users size={24} />
            </div>
            <div className="overflow-hidden min-w-0">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 truncate transition-colors">Registered Users</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white truncate transition-colors">{userCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm transition-all hover:shadow-md sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-lg transition-colors flex-shrink-0">
              <Star size={24} />
            </div>
            <div className="overflow-hidden min-w-0">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 truncate transition-colors">Total Reviews</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white truncate transition-colors">{reviewCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 pt-8 border-t border-slate-200 dark:border-zinc-800 transition-colors">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors">Quick Actions</h2>
        <Link 
          href="/admin/movies" 
          className="inline-flex items-center justify-center px-6 py-3.5 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm w-full sm:w-auto"
        >
          Manage Database &rarr;
        </Link>
      </div>
    </div>
  );
}