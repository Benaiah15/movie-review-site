"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SessionGuardian({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    // THE FIX: The OAuth Transit Bridge. 
    // This catches your Admin flag after Google wiped the sessionStorage!
    if (typeof window !== "undefined" && localStorage.getItem("oauth_admin_transit") === "true") {
       sessionStorage.setItem("admin_session", "active");
       localStorage.removeItem("oauth_admin_transit");
    }

    if (status === "authenticated") {
      // Using the bulletproof backend flag we created
      const isAdmin = (session?.user as any)?.isAdmin === true || session?.user?.name === "Admin";
      const isStrictAdminRoute = pathname.startsWith("/admin");

      if (isAdmin) {
        if (isStrictAdminRoute && !sessionStorage.getItem("admin_session")) {
          signOut({ callbackUrl: "/admin/login" });
        }
      } else {
        const hasPersistent = localStorage.getItem("user_persistent");
        const hasTemp = sessionStorage.getItem("user_temp");

        if (!hasPersistent && !hasTemp) {
          signOut({ callbackUrl: "/login" });
        }
      }
    }
  }, [status, session, pathname]);

  return <>{children}</>;
}