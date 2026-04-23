"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SessionGuardian({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    // THE FIX: We removed the aggressive "unauthenticated" memory wipe from here.
    // It was deleting your admin_session flag during the Google redirect!

    if (status === "authenticated") {
      const isAdmin = session?.user?.name === "Admin";
      const isStrictAdminRoute = pathname.startsWith("/admin");

      if (isAdmin) {
        // Enforce the strict tab-close rule for Admins
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