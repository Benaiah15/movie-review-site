import { Clapperboard, Menu, X } from "lucide-react";
import "../globals.css"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import SidebarLinks from "@/components/admin/SidebarLinks";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Verifies against the secure .env file
  if (!session || session?.user?.email !== process.env.MASTER_ADMIN_EMAIL) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-900 transition-colors duration-300">
      
      {/* HIDDEN CHECKBOX FOR MOBILE MENU TOGGLE */}
      <input type="checkbox" id="mobile-sidebar-toggle" className="peer hidden" />

      {/* DARK OVERLAY (Visible on mobile when menu is open) */}
      <label 
        htmlFor="mobile-sidebar-toggle" 
        className="fixed inset-0 bg-black/60 z-40 hidden peer-checked:block md:hidden backdrop-blur-sm transition-opacity"
      ></label>

      {/* SIDEBAR (Hidden on mobile by default, slides in when peer is checked) */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-900 p-6 flex flex-col gap-4 transform -translate-x-full peer-checked:translate-x-0 md:relative md:translate-x-0 transition-transform duration-300 ease-in-out">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-lg text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              <Clapperboard size={24} />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-wider">
              MOVIE<span className="text-red-600">SPACE</span>
            </h1>
          </div>
          
          {/* Close button inside sidebar (Mobile only) */}
          <label htmlFor="mobile-sidebar-toggle" className="md:hidden cursor-pointer text-slate-500 hover:text-red-600 transition-colors">
            <X size={24} />
          </label>
        </div>

        {/* Dynamic Glowing Links injected here */}
        <nav className="flex-1 flex flex-col gap-2">
          <SidebarLinks /> 
        </nav>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* MOBILE HEADER (Only visible on small screens) */}
        <header className="md:hidden flex items-center justify-between bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-900 p-4 sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-1.5 rounded-lg text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]">
              <Clapperboard size={18} />
            </div>
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-wider">
              MOVIE<span className="text-red-600">SPACE</span>
            </h1>
          </div>
          
          {/* Hamburger Icon */}
          <label htmlFor="mobile-sidebar-toggle" className="cursor-pointer text-slate-900 dark:text-white p-1 hover:text-red-600 transition-colors">
            <Menu size={26} />
          </label>
        </header>

        {/* ACTUAL PAGE CONTENT */}
        <main className="flex-1 p-4 md:p-8 text-slate-900 dark:text-slate-100">
          {children}
        </main>

      </div>
    </div>
  );
}