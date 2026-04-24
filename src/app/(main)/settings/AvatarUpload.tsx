"use client";

import { UploadButton } from "@/lib/uploadthing";
import "@uploadthing/react/styles.css"; // THE MISSING MAGIC BULLET! This hides the ugly default text.
import { UserCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AvatarUpload({ currentImage }: { currentImage: string | null }) {
  const { update } = useSession();
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full max-w-full overflow-hidden">
      
      {/* Avatar Preview */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full dark:bg-zinc-800 bg-gray-100 border-2 dark:border-zinc-700 border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 transition-colors shadow-sm">
        {currentImage ? (
          <img src={currentImage} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <UserCircle size={48} className="dark:text-zinc-500 text-zinc-400" />
        )}
      </div>

      {/* Upload Component */}
      <div className="flex flex-col items-center sm:items-start w-full min-w-0">
        <h3 className="dark:text-white text-zinc-900 font-bold text-base sm:text-lg mb-2 sm:mb-3 transition-colors text-center sm:text-left">Profile Avatar</h3>
        
        <div className="w-full overflow-hidden flex justify-center sm:justify-start">
          <UploadButton
            endpoint="avatarUploader"
            // We use inline CSS objects here so Tailwind can't interfere with it
            appearance={{
              button: {
                background: "#dc2626", // MovieSpace Red
                color: "#ffffff",
                fontWeight: "bold",
                fontSize: "14px",
                padding: "8px 24px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap", // Prevents text from wrapping awkwardly
                width: "auto",
              },
              container: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "max-content",
              },
              allowedContent: {
                display: "none", // Completely destroys the "Image 4MB" text
              }
            }}
            content={{
              button({ ready, isUploading }) {
                if (isUploading) return "Uploading...";
                if (ready) return "Upload Image"; 
                return "Loading...";
              },
            }}
            onClientUploadComplete={async () => {
              await update();
              router.refresh();
              window.location.reload();
            }}
            onUploadError={(error: Error) => {
              alert(`Upload Failed: ${error.message}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}