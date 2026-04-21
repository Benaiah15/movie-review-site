"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Film, Settings } from "lucide-react";

export default function SidebarLinks() {
  const pathname = usePathname();

  const getLinkStyle = (path: string) => {
    const isActive = pathname === path;
    if (isActive) {
      return "flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 font-medium transition-colors border border-red-100 dark:border-red-500/20 shadow-[0_0_15px_rgba(220,38,38,0.15)]";
    }
    return "flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white text-slate-600 dark:text-zinc-400 font-medium transition-colors";
  };

  return (
    <>
      <Link href="/admin" className={getLinkStyle('/admin')}>
        <LayoutDashboard size={20} /> Dashboard
      </Link>
      <Link href="/admin/movies" className={getLinkStyle('/admin/movies')}>
        <Film size={20} /> Manage Movies
      </Link>
      <Link href="/admin/settings" className={getLinkStyle('/admin/settings')}>
        <Settings size={20} /> Settings
      </Link>
    </>
  );
}