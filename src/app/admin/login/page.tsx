"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Identify if a normal user is intruding
  const isQuarantining = status === "authenticated" && session?.user?.name !== "Admin";

  useEffect(() => {
    if (isQuarantining) {
      signOut({ callbackUrl: "/login" });
    }
  }, [isQuarantining]);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    sessionStorage.setItem("admin_session", "active");
    signIn("google", { callbackUrl: '/admin' });
  };

  const loginAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    sessionStorage.setItem("admin_session", "active");

    signIn("credentials", { 
      password, 
      isAdminLogin: "true", 
      redirect: false 
    }).then((callback) => {
      setIsLoading(false);
      if (callback?.error) {
        setError("Invalid Master Passcode.");
      }
      if (callback?.ok && !callback?.error) {
        router.push("/admin");
        router.refresh();
      }
    });
  };

  // Normal loading state (no scary text)
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#050505] bg-gray-100">
        <Loader2 size={48} className="animate-spin text-red-600" />
      </div>
    );
  }

  // Aggressive purging state (only shows if a normal user is being kicked out)
  if (isQuarantining) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center dark:bg-[#050505] bg-gray-100">
        <Loader2 size={48} className="animate-spin text-red-600 mb-6" />
        <h2 className="text-xl font-bold dark:text-white text-zinc-900 tracking-wider uppercase mb-2">Purging Session Data</h2>
        <p className="text-sm dark:text-zinc-500 text-zinc-600 font-mono text-center max-w-xs">Unauthorized credentials detected. Redirecting to standard login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-[#050505] bg-gray-100 p-4 transition-colors duration-300">
      <div className="w-full max-w-md dark:bg-zinc-950 bg-white border dark:border-red-900/50 border-red-200 rounded-2xl p-8 shadow-[0_0_30px_rgba(220,38,38,0.1)] relative overflow-hidden transition-colors duration-300">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-900 via-red-500 to-red-900"></div>

        <div className="text-center mb-8 flex flex-col items-center">
          <ShieldAlert size={48} className="text-red-600 mb-4" />
          <h2 className="text-2xl font-bold dark:text-white text-zinc-900 tracking-wider uppercase transition-colors">Restricted Access</h2>
          <p className="text-sm dark:text-zinc-400 text-zinc-600 mt-2 transition-colors">MovieSpace Administration Node</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border dark:border-red-500/50 border-red-300 text-red-600 dark:text-red-500 text-sm p-3 rounded-md mb-6 text-center transition-colors">
            {error}
          </div>
        )}

        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 dark:bg-zinc-900 bg-gray-50 border dark:border-zinc-800 border-gray-300 rounded-lg dark:text-white text-zinc-900 dark:hover:bg-zinc-800 hover:bg-gray-100 transition-colors shadow-sm disabled:opacity-50"
        >
          {isLoading ? (
             <Loader2 size={20} className="animate-spin text-zinc-500" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          {isLoading ? "Authenticating..." : "Google Workspace"}
        </button>

        <div className="relative flex items-center justify-center py-6">
          <div className="absolute border-t dark:border-zinc-800 border-gray-300 w-full transition-colors"></div>
          <span className="relative px-4 text-xs tracking-widest uppercase dark:text-zinc-600 text-zinc-500 dark:bg-zinc-950 bg-white transition-colors">Or</span>
        </div>

        <form onSubmit={loginAdmin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest dark:text-zinc-500 text-zinc-600 mb-2 transition-colors">Master Passcode</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 dark:bg-zinc-900 bg-gray-50 border dark:border-zinc-800 border-gray-300 rounded-lg dark:text-white text-zinc-900 font-mono focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 pr-12 transition-colors"
                placeholder="••••••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 font-bold tracking-widest uppercase text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50 shadow-sm"
          >
            {isLoading ? "Unlocking..." : "Override & Enter"}
          </button>
        </form>

      </div>
    </div>
  );
}