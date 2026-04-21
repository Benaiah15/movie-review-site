import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full dark:bg-zinc-950 bg-white border-t dark:border-zinc-900 border-gray-200 pt-12 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        
        {/* BRAND WITH CUSTOM LOGO & MATCHING GLOW */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="MovieSpace Logo" 
              fill 
              className="object-contain transition-all duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(220,38,38,0.6)] dark:drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] group-hover:drop-shadow-[0_0_15px_rgba(220,38,38,1)] dark:group-hover:drop-shadow-[0_0_25px_rgba(220,38,38,1)]" 
            />
          </div>
          <span className="text-xl font-black dark:text-white text-zinc-900 tracking-wider transition-colors">
            MOVIE<span className="text-red-600">SPACE</span>
          </span>
        </Link>

        {/* EXTERNAL SOCIAL LINKS: Replace the "#" with your URLs when ready */}
        <div className="flex items-center flex-wrap justify-center gap-6 text-sm font-bold dark:text-zinc-500 text-zinc-500">
          <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 dark:hover:text-red-500 transition-colors">Facebook</a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 dark:hover:text-red-500 transition-colors">Twitter / X</a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 dark:hover:text-red-500 transition-colors">Instagram</a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 dark:hover:text-red-500 transition-colors">TikTok</a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium dark:text-zinc-500 text-zinc-500 transition-colors">
        
        {/* INTERNAL PAGE LINKS: These will point to routes you build later */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/about" className="dark:hover:text-zinc-300 hover:text-zinc-900 transition-colors">About Us</Link>
          <Link href="/help" className="dark:hover:text-zinc-300 hover:text-zinc-900 transition-colors">Help Center</Link>
          <Link href="/privacy" className="dark:hover:text-zinc-300 hover:text-zinc-900 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="dark:hover:text-zinc-300 hover:text-zinc-900 transition-colors">Terms of Service</Link>
        </div>
        
        <p className="text-center md:text-left">© {new Date().getFullYear()} MovieSpace. All rights reserved.</p>
      </div>
    </footer>
  );
}