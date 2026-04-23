"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SessionGuardian({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    // THE FIX: If the user logs out, wipe all browser memory!
    // This stops the "Stay logged in" choice from bleeding into their next login.
    if (status === "unauthenticated") {
      localStorage.removeItem("user_persistent");
      sessionStorage.removeItem("user_temp");
      sessionStorage.removeItem("admin_session");
      return;
    }

    if (status === "authenticated") {
      const isAdmin = session?.user?.name === "Admin";
      
      // Check if the current URL is inside the protected admin area
      const isStrictAdminRoute = pathname.startsWith("/admin");

      if (isAdmin) {
        // Enforce the strict tab-close rule. (sessionStorage auto-deletes when tab closes)
        if (isStrictAdminRoute && !sessionStorage.getItem("admin_session")) {
          signOut({ callbackUrl: "/admin/login" });
        }
      } else {
        // Regular user logic
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