"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { LogOut, LayoutDashboard, Home, Film, Users, Menu, X, Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="border-b dark:border-zinc-800 border-gray-200 dark:bg-zinc-950/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-10">
          
          <Link href="/" onClick={closeMenu} className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 md:w-9 md:h-9 flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="MovieSpace Logo" 
                fill 
                /* CRANKED UP GLOW: Much brighter in dark mode, massive flare on hover! */
                className="object-contain transition-all duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(220,38,38,0.6)] dark:drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] group-hover:drop-shadow-[0_0_15px_rgba(220,38,38,1)] dark:group-hover:drop-shadow-[0_0_25px_rgba(220,38,38,1)]"
                priority 
              />
            </div>
            <span className="text-xl font-black dark:text-white text-zinc-900 tracking-tighter transition-colors hidden sm:block">
              MOVIE<span className="text-red-600">SPACE</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className={cn("flex items-center gap-2 transition-colors", pathname === "/" ? "dark:text-white text-zinc-900 font-bold" : "dark:text-zinc-400 text-zinc-600 dark:hover:text-white hover:text-zinc-900")}>
              <Home size={16} /> Home
            </Link>
            <Link href="/movies" className={cn("flex items-center gap-2 transition-colors", pathname === "/movies" ? "dark:text-white text-zinc-900 font-bold" : "dark:text-zinc-400 text-zinc-600 dark:hover:text-white hover:text-zinc-900")}>
              <Film size={16} /> Movies
            </Link>
            {user && (
              <Link href="/feed" className={cn("flex items-center gap-2 transition-colors", pathname === "/feed" ? "dark:text-white text-zinc-900 font-bold" : "dark:text-zinc-400 text-zinc-600 dark:hover:text-white hover:text-zinc-900")}>
                <Users size={16} /> Feed
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 dark:text-zinc-400 text-zinc-500 dark:hover:text-white hover:text-zinc-900 transition-colors rounded-full dark:hover:bg-zinc-800 hover:bg-gray-100"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-6">
                {user.name === "Admin" && (
                  <Link href="/admin" className="text-sm font-bold text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-2">
                    <LayoutDashboard size={16} /> Admin
                  </Link>
                )}

                <Link href="/profile" className="flex items-center gap-3 group px-2 py-1 rounded-full dark:hover:bg-zinc-900 hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium dark:text-zinc-400 text-zinc-600 dark:group-hover:text-white group-hover:text-zinc-900 transition-colors">
                    Hi, {user.name?.split(" ")[0] || "Cinephile"}
                  </span>
                  
                  {user.image ? (
                    <img src={user.image} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 dark:border-zinc-800 border-gray-200 group-hover:border-red-500 transition-colors shadow-sm" />
                  ) : (
                    <div className="w-9 h-9 rounded-full dark:bg-zinc-800 bg-gray-200 border-2 dark:border-zinc-800 border-gray-200 flex items-center justify-center text-sm font-bold dark:text-white text-zinc-900 group-hover:border-red-500 transition-all shadow-sm">
                      {userInitial}
                    </div>
                  )}
                </Link>

                <button onClick={() => signOut()} className="dark:text-zinc-400 text-zinc-600 hover:text-red-600 dark:hover:text-red-500 transition-colors" title="Sign Out">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-sm font-medium">
                <Link href="/login" className="dark:text-zinc-400 text-zinc-600 dark:hover:text-white hover:text-zinc-900 transition-colors">Sign In</Link>
                <Link href="/register" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Register</Link>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden dark:text-zinc-400 text-zinc-600 dark:hover:text-white hover:text-zinc-900 p-2 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full dark:bg-zinc-950 bg-white border-b dark:border-zinc-800 border-gray-200 shadow-2xl px-6 py-4 flex flex-col gap-2 animate-in slide-in-from-top-2 transition-colors">
          <Link href="/" onClick={closeMenu} className="flex items-center gap-3 dark:text-zinc-400 text-zinc-600 dark:hover:text-white hover:text-zinc-900 py-3 font-medium transition-colors">
            <Home size={18} /> Home
          </Link>
          <Link href="/movies" onClick={closeMenu} className="flex items-center gap-3 dark:text-zinc-400 text-zinc-600 dark:hover:text-white hover:text-zinc-900 py-3 font-medium transition-colors">
            <Film size={18} /> Movies
          </Link>
          
          {user ? (
            <>
              <Link href="/feed" onClick={closeMenu} className="flex items-center gap-3 dark:text-zinc-400 text-zinc-600 dark:hover:text-white hover:text-zinc-900 py-3 font-medium transition-colors">
                <Users size={18} /> Feed
              </Link>
              {user.name === "Admin" && (
                <Link href="/admin" onClick={closeMenu} className="flex items-center gap-3 text-amber-500 py-3 font-medium transition-colors">
                  <LayoutDashboard size={18} /> Admin Dashboard
                </Link>
              )}
              
              <div className="border-t dark:border-zinc-800 border-gray-200 mt-2 pt-2 transition-colors">
                <Link href="/profile" onClick={closeMenu} className="flex items-center gap-3 dark:text-zinc-400 text-zinc-600 dark:hover:text-white hover:text-zinc-900 py-3 font-medium transition-colors">
                  {user.image ? (
                     <img src={user.image} alt="Profile" className="w-8 h-8 rounded-full object-cover border dark:border-zinc-800 border-gray-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full dark:bg-zinc-800 bg-gray-200 flex items-center justify-center text-xs font-bold dark:text-white text-zinc-900 border dark:border-zinc-800 border-gray-200 transition-colors">{userInitial}</div>
                  )}
                  My Profile
                </Link>
                <button onClick={() => { signOut(); closeMenu(); }} className="flex items-center gap-3 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 py-3 w-full text-left font-medium transition-colors">
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3 pt-4 mt-2 border-t dark:border-zinc-800 border-gray-200 transition-colors">
              <Link href="/login" onClick={closeMenu} className="dark:text-zinc-400 text-zinc-600 dark:hover:text-white hover:text-zinc-900 py-2.5 text-center font-bold border dark:border-zinc-800 border-gray-300 rounded-lg transition-colors">Sign In</Link>
              <Link href="/register" onClick={closeMenu} className="bg-red-600 text-white py-2.5 rounded-lg text-center font-bold hover:bg-red-700 transition-colors">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}