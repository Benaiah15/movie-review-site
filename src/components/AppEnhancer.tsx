"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, X, Share } from "lucide-react";

export default function AppEnhancer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);

  useEffect(() => {
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches 
                         || (window.navigator as any).standalone;
    setIsStandalone(!!checkStandalone);

    if (checkStandalone) return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowInstallBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (isIosDevice) {
      setTimeout(() => setShowInstallBanner(true), 3500);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      {/* 1. THE PAGE ANIMATION */}
      {/* We replaced the broken Tailwind classes with our native 'animate-page-enter' class */}
      <div 
        key={pathname} 
        className="animate-page-enter flex-1 flex flex-col w-full min-h-screen"
      >
        {children}
      </div>

      {/* 2. THE INSTALL BANNER ANIMATION */}
      {showInstallBanner && !isStandalone && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-[400px] z-[99999] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-zinc-800/50 p-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] animate-banner-enter flex items-center gap-4">
          
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
            onClick={() => setShowInstallBanner(false)} 
            className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
}