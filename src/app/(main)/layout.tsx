import "../globals.css";
import Footer from "@/components/Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col dark:bg-zinc-950 bg-gray-50 dark:text-slate-100 text-zinc-900 font-sans selection:bg-red-500/30 transition-colors duration-300">
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}