"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { LogOut, LayoutDashboard, Home, Film, Users, Menu, X, Sun, Moon, Newspaper, Bell, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // ==========================================
  // Premium Animation States
  // ==========================================
  
  // Mobile Menu State
  const [isMobileMenuMounted, setIsMobileMenuMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifMounted, setIsNotifMounted] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch Notifications
  useEffect(() => {
    setMounted(true);
    if (user) {
      const fetchNotifs = () => {
        fetch("/api/notifications")
          .then(res => res.json())
          .then(data => {
            if(Array.isArray(data)) setNotifications(data);
          })
          .catch(() => null);
      };
      fetchNotifs(); 
      const interval = setInterval(fetchNotifs, 15000); 
      return () => clearInterval(interval); 
    }
  }, [user]);

  // Click Outside Logic (Closes notifications smoothly)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isNotifOpen) {
          setIsNotifOpen(false);
          setTimeout(() => setIsNotifMounted(false), 300); // Wait for animation to finish
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotifOpen]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Toggle Notifications with Animation
  const handleToggleNotifications = () => {
    if (isNotifOpen) {
      setIsNotifOpen(false);
      setTimeout(() => setIsNotifMounted(false), 300);
    } else {
      setIsNotifMounted(true);
      setTimeout(() => setIsNotifOpen(true), 10);
      
      // Mark as read when opening
      if (unreadCount > 0) {
        fetch("/api/notifications", { method: "PATCH" });
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      }
    }
  };

  // Toggle Mobile Menu with Animation
  const handleToggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
      setTimeout(() => setIsMobileMenuMounted(false), 300);
    } else {
      setIsMobileMenuMounted(true);
      setTimeout(() => setIsMobileMenuOpen(true), 10);
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  
  // Close everything smoothly on link click
  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsNotifOpen(false);
    setTimeout(() => {
      setIsMobileMenuMounted(false);
      setIsNotifMounted(false);
    }, 300);
  };

  return (
    <nav className="border-b dark:border-zinc-800 border-gray-200 dark:bg-zinc-950/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between relative">
        
        {/* LOGO & DESKTOP LINKS */}
        <div className="flex items-center gap-10">
          <Link href="/" onClick={closeAllMenus} className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative w-8 h-8 md:w-9 md:h-9 flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="MovieSpace Logo" 
                fill 
                className="object-contain transition-all duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(220,38,38,0.6)] dark:drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] group-hover:drop-shadow-[0_0_15px_rgba(220,38,38,1)] dark:group-hover:drop-shadow-[0_0_25px_rgba(220,38,38,1)]"
                priority 
              />
            </div>
            <span className="text-lg sm:text-xl font-black dark:text-white text-zinc-900 tracking-tighter transition-colors">
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
            <Link href="/news" className={cn("flex items-center gap-2 transition-colors", pathname === "/news" ? "dark:text-white text-zinc-900 font-bold" : "dark:text-zinc-400 text-zinc-600 dark:hover:text-white hover:text-zinc-900")}>
              <Newspaper size={16} /> News
            </Link>
            {user && (
              <Link href="/feed" className={cn("flex items-center gap-2 transition-colors", pathname === "/feed" ? "dark:text-white text-zinc-900 font-bold" : "dark:text-zinc-400 text-zinc-600 dark:hover:text-white hover:text-zinc-900")}>
                <Users size={16} /> Feed
              </Link>
            )}
          </div>
        </div>

        {/* ICONS & ACTIONS (Right Side) */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* THE NOTIFICATION BELL */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={handleToggleNotifications}
                className="relative p-2 dark:text-zinc-400 text-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-full dark:hover:bg-zinc-800 hover:bg-gray-100"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950"></span>
                )}
              </button>

              {/* iOS-STYLE ANIMATED NOTIFICATION DROPDOWN */}
              {isNotifMounted && (
                <div 
                  className={`fixed top-16 left-4 right-4 sm:absolute sm:top-12 sm:right-0 sm:left-auto sm:w-[350px] max-h-[400px] overflow-y-auto dark:bg-zinc-950 bg-white border dark:border-zinc-800 border-gray-200 rounded-xl shadow-2xl z-50 py-2 origin-top-right transform transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isNotifOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
                  }`}
                >
                  <div className="px-4 py-2 border-b dark:border-zinc-800 border-gray-200 flex justify-between items-center sticky top-0 dark:bg-zinc-950 bg-white z-10">
                    <h3 className="font-bold dark:text-white text-zinc-900 text-sm">Notifications</h3>
                    {unreadCount > 0 && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm dark:text-zinc-500 text-zinc-500">
                      No notifications yet.
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {notifications.map((notif) => (
                        <Link 
                          key={notif.id} 
                          href={notif.link || "#"} 
                          onClick={closeAllMenus}
                          className={`flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors border-b dark:border-zinc-800/50 border-gray-100 last:border-0 ${!notif.isRead ? 'dark:bg-zinc-900/30 bg-red-50/30' : ''}`}
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 dark:bg-zinc-800 bg-gray-200">
                            {notif.actor.image ? (
                              <img src={notif.actor.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <UserCircle className="w-full h-full text-zinc-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs dark:text-zinc-300 text-zinc-700 leading-snug">
                              <span className="font-bold dark:text-white text-zinc-900">{notif.actor.name}</span> {notif.message}
                            </p>
                            <span className="text-[10px] dark:text-zinc-500 text-zinc-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* THEME TOGGLE */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 dark:text-zinc-400 text-zinc-500 dark:hover:text-white hover:text-zinc-900 transition-colors rounded-full dark:hover:bg-zinc-800 hover:bg-gray-100"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}

          {/* DESKTOP PROFILE */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-6">
                
                {/* Desktop Admin Check */}
                {(user as any).role === "ADMIN" && (
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
                <Link href="/register" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm">Register</Link>
              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <button 
            onClick={handleToggleMobileMenu} 
            className="md:hidden dark:text-zinc-400 text-zinc-600 dark:hover:text-white hover:text-zinc-900 p-1.5 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* iOS-STYLE ANIMATED MOBILE MENU PANEL */}
      {isMobileMenuMounted && (
        <div 
          className={`md:hidden absolute top-16 left-0 w-full dark:bg-zinc-950 bg-white border-b dark:border-zinc-800 border-gray-200 shadow-2xl px-6 py-4 flex flex-col gap-2 origin-top transform transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <Link href="/" onClick={closeAllMenus} className="flex items-center gap-3 dark:text-zinc-400 text-zinc-600 dark:hover:text-white hover:text-zinc-900 py-3 font-medium transition-colors">
            <Home size={18} /> Home
          </Link>
          <Link href="/movies" onClick={closeAllMenus} className="flex items-center gap-3 dark:text-zinc-400 text-zinc-600 dark:hover:text-white hover:text-zinc-900 py-3 font-medium transition-colors">
            <Film size={18} /> Movies
          </Link>
          <Link href="/news" onClick={closeAllMenus} className="flex items-center gap-3 dark:text-zinc-400 text-zinc-600 dark:hover:text-white hover:text-zinc-900 py-3 font-medium transition-colors">
            <Newspaper size={18} /> News
          </Link>
          
          {user ? (
            <>
              <Link href="/feed" onClick={closeAllMenus} className="flex items-center gap-3 dark:text-zinc-400 text-zinc-600 dark:hover:text-white hover:text-zinc-900 py-3 font-medium transition-colors">
                <Users size={18} /> Feed
              </Link>
              
              {/* Mobile Admin Check */}
              {(user as any).role === "ADMIN" && (
                <Link href="/admin" onClick={closeAllMenus} className="flex items-center gap-3 text-amber-500 py-3 font-medium transition-colors">
                  <LayoutDashboard size={18} /> Admin Dashboard
                </Link>
              )}
              
              <div className="border-t dark:border-zinc-800 border-gray-200 mt-2 pt-2 transition-colors">
                <Link href="/profile" onClick={closeAllMenus} className="flex items-center gap-3 dark:text-zinc-400 text-zinc-600 dark:hover:text-white hover:text-zinc-900 py-3 font-medium transition-colors">
                  {user.image ? (
                     <img src={user.image} alt="Profile" className="w-8 h-8 rounded-full object-cover border dark:border-zinc-800 border-gray-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full dark:bg-zinc-800 bg-gray-200 flex items-center justify-center text-xs font-bold dark:text-white text-zinc-900 border dark:border-zinc-800 border-gray-200 transition-colors">{userInitial}</div>
                  )}
                  My Profile
                </Link>
                <button onClick={() => { signOut(); closeAllMenus(); }} className="flex items-center gap-3 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 py-3 w-full text-left font-medium transition-colors">
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3 pt-4 mt-2 border-t dark:border-zinc-800 border-gray-200 transition-colors">
              <Link href="/login" onClick={closeAllMenus} className="dark:text-zinc-400 text-zinc-600 dark:hover:text-white hover:text-zinc-900 py-2.5 text-center font-bold border dark:border-zinc-800 border-gray-300 rounded-lg transition-colors">Sign In</Link>
              <Link href="/register" onClick={closeAllMenus} className="bg-red-600 text-white py-2.5 rounded-lg text-center font-bold hover:bg-red-700 transition-colors shadow-sm">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}