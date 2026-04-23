"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SessionGuardian({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    // Recover session from Google transit
    if (typeof window !== "undefined" && localStorage.getItem("oauth_admin_transit") === "true") {
       sessionStorage.setItem("admin_session", "active");
       localStorage.removeItem("oauth_admin_transit");
    }

    if (status === "authenticated") {
      const isAdmin = (session?.user as any)?.isAdmin === true || session?.user?.name === "Admin";
      const isStrictAdminRoute = pathname.startsWith("/admin");
      
      // Identify if the user is currently on a login page
      const isLoginRoute = pathname === "/admin/login" || pathname === "/login";

      if (isAdmin) {
        if (isStrictAdminRoute && !sessionStorage.getItem("admin_session")) {
          signOut({ callbackUrl: "/admin/login" });
        }
      } else {
        const hasPersistent = localStorage.getItem("user_persistent");
        const hasTemp = sessionStorage.getItem("user_temp");

        // THE FIX: Do not auto-kick them if they are on the Admin Login page! 
        // We need them to stay there to see the diagnostic error screen.
        if (!hasPersistent && !hasTemp && !isLoginRoute) {
          signOut({ callbackUrl: "/login" });
        }
      }
    }
  }, [status, session, pathname]);

  return <>{children}</>;
}