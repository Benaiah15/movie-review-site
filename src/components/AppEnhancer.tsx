"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, X, Share } from "lucide-react";

export default function AppEnhancer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 1. Animation State (Controls the page glide)
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // 2. PWA State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // Default to true to prevent flashes

  // Trigger Page Animation perfectly on EVERY route change
  useEffect(() => {
    setIsPageLoaded(false); // Instantly drop opacity to 0
    const timer = setTimeout(() => setIsPageLoaded(true), 50); // Glide it up smoothly
    return () => clearTimeout(timer);
  }, [pathname]);

  // PWA Detection Logic
  useEffect(() => {
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches 
                         || (window.navigator as any).standalone;
    setIsStandalone(!!checkStandalone);

    // If already installed, don't trigger anything
    if (checkStandalone) return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait 3 seconds, then slide up the install banner
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (isIosDevice) {
      setTimeout(() => setShowBanner(true), 3500);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowBanner(false);
    setDeferredPrompt(null);
  };

  return (
    <>
      {/* ========================================= */}
      {/* THE PAGE ANIMATION (Native Tailwind)        */}
      {/* ========================================= */}
      <div
        className={`flex-1 flex flex-col w-full min-h-screen transform transition-all duration-[500ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {children}
      </div>

      {/* ========================================= */}
      {/* THE INSTALL BANNER ANIMATION                */}
      {/* ========================================= */}
      {!isStandalone && (
        <div
          className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-[400px] z-[99999] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-zinc-800/50 p-4 rounded-2xl shadow-2xl transform transition-all duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-4 ${
            showBanner ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-16 scale-95 pointer-events-none"
          }`}
        >
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg border border-red-500/50">
            <Download className="text-white" size={24} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-zinc-900 dark:text-white text-sm">Get the App</h4>
            {isIOS ? (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-tight flex items-center flex-wrap gap-1">
                Tap <Share size={12} className="inline mb-0.5"/> then <b>Add to Home Screen</b>
              </p>
            ) : (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-tight">
                Install MovieSpace for a faster, seamless experience.
              </p>
            )}
          </div>

          {!isIOS && deferredPrompt && (
            <button 
              onClick={handleInstallClick} 
              className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold px-4 py-2 rounded-full transition-transform active:scale-95 shrink-0"
            >
              Install
            </button>
          )}

          <button 
            onClick={() => setShowBanner(false)} 
            className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
}