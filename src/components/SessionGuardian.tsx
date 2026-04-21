"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SessionGuardian({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "authenticated") {
      const isAdmin = session?.user?.name === "Admin";
      
      // Check if the current URL is inside the protected admin area
      const isStrictAdminRoute = pathname.startsWith("/admin");

      if (isAdmin) {
        // Only enforce the strict tab-close rule if they are actively in the dashboard
        if (isStrictAdminRoute && !sessionStorage.getItem("admin_session")) {
          signOut({ callbackUrl: "/admin/login" });
        }
      } else {
        // Regular user logic remains the same
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