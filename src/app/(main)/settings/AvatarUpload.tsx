"use client";

import { UploadButton } from "@/lib/uploadthing";
import { UserCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AvatarUpload({ currentImage }: { currentImage: string | null }) {
  // Pull in the update function from NextAuth to refresh the cookie
  const { update } = useSession();
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
      {/* Current Avatar */}
      <div className="w-20 h-20 rounded-full dark:bg-zinc-800 bg-gray-100 border-2 dark:border-zinc-700 border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 transition-colors">
        {currentImage ? (
          <img src={currentImage} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <UserCircle size={40} className="dark:text-zinc-500 text-zinc-400" />
        )}
      </div>

      {/* UploadThing Button UI */}
      <div className="flex-1">
        <h3 className="dark:text-white text-zinc-900 font-bold text-lg mb-2 transition-colors">Profile Avatar</h3>
        <UploadButton
          endpoint="avatarUploader"
          appearance={{
            button: "bg-red-600 text-white font-bold text-sm px-6 py-2 rounded-lg hover:bg-red-700 transition-colors focus-within:ring-2 focus-within:ring-red-500",
            allowedContent: "dark:text-zinc-500 text-zinc-600 text-xs mt-1 transition-colors",
          }}
          content={{
            // Added better loading states for perceived performance
            button({ ready, isUploading }) {
              if (isUploading) return "Uploading... please wait";
              if (ready) return "Upload New Image";
              return "Loading...";
            },
          }}
          onClientUploadComplete={async (res) => {
            // Force NextAuth to refresh the session cookie for the Navbar
            await update();
            router.refresh();
            
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          }}
          onUploadError={(error: Error) => {
            alert(`Upload Failed: ${error.message}`);
          }}
        />
      </div>
    </div>
  );
}