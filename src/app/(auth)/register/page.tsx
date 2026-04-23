"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const registerUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // THE FIX: Set persistent login memory so Guardian doesn't kick them out instantly
        localStorage.setItem("user_persistent", "active");

        signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        }).then((callback) => {
          if (callback?.ok) {
            router.push("/");
            router.refresh();
          }
        });
      } else {
        const errorText = await response.text();
        setError(errorText || "Something went wrong.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("An error occurred during registration.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 bg-gray-50 p-4 transition-colors duration-300">
      <div className="w-full max-w-md dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-gray-200 rounded-2xl p-8 shadow-xl transition-colors duration-300">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black tracking-tighter dark:text-white text-zinc-900 transition-colors">
            MOVIE<span className="text-red-600">SPACE</span>
          </Link>
          <h2 className="text-xl font-semibold dark:text-white text-zinc-900 mt-4 transition-colors">Create an account</h2>
          <p className="text-sm dark:text-zinc-400 text-zinc-600 mt-1 transition-colors">Join the community today</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border dark:border-red-500/50 border-red-200 text-red-600 dark:text-red-500 text-sm p-3 rounded-md mb-4 text-center transition-colors">
            {error}
          </div>
        )}

        <form onSubmit={registerUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-zinc-300 text-zinc-700 mb-1 transition-colors">Username</label>
            <input 
              type="text" 
              required
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full px-4 py-3 dark:bg-zinc-950 bg-gray-50 border dark:border-zinc-800 border-gray-300 rounded-lg dark:text-white text-zinc-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              placeholder="Cinephile99"
            />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-zinc-300 text-zinc-700 mb-1 transition-colors">Email</label>
            <input 
              type="email" 
              required
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="w-full px-4 py-3 dark:bg-zinc-950 bg-gray-50 border dark:border-zinc-800 border-gray-300 rounded-lg dark:text-white text-zinc-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-zinc-300 text-zinc-700 mb-1 transition-colors">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                className="w-full px-4 py-3 dark:bg-zinc-950 bg-gray-50 border dark:border-zinc-800 border-gray-300 rounded-lg dark:text-white text-zinc-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 pr-12 transition-colors"
                placeholder="••••••••"
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
            className="w-full py-3 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50 shadow-sm"
          >
            {isLoading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="relative flex items-center justify-center py-6">
          <div className="absolute border-t dark:border-zinc-800 border-gray-200 w-full transition-colors"></div>
          <span className="relative px-4 text-sm dark:text-zinc-500 text-zinc-500 dark:bg-zinc-900 bg-white transition-colors">Or continue with</span>
        </div>

        <button 
          onClick={() => {
            localStorage.setItem("user_persistent", "active");
            signIn("google", { callbackUrl: '/' });
          }}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 dark:bg-zinc-950 bg-white border dark:border-zinc-800 border-gray-300 rounded-lg dark:text-white text-zinc-700 dark:hover:bg-zinc-800 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>

        <p className="mt-8 text-center text-sm dark:text-zinc-400 text-zinc-600 transition-colors">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}