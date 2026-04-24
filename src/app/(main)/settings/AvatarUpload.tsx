"use client";

import { UploadButton } from "@/lib/uploadthing";
import { UserCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AvatarUpload({ currentImage }: { currentImage: string | null }) {
  const { update } = useSession();
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full max-w-full overflow-hidden">
      
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full dark:bg-zinc-800 bg-gray-100 border-2 dark:border-zinc-700 border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 transition-colors shadow-sm">
        {currentImage ? (
          <img src={currentImage} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <UserCircle size={48} className="dark:text-zinc-500 text-zinc-400" />
        )}
      </div>

      <div className="flex flex-col items-center sm:items-start w-full min-w-0">
        <h3 className="dark:text-white text-zinc-900 font-bold text-base sm:text-lg mb-2 sm:mb-3 transition-colors text-center sm:text-left">Profile Avatar</h3>
        
        <div className="w-full overflow-hidden flex justify-center sm:justify-start">
          <UploadButton
            endpoint="avatarUploader"
            appearance={{
              container: "flex flex-col items-center sm:items-start w-full",
              // We force exact dimensions and absolute background color so it cannot fail
              button: "bg-[#dc2626] text-white font-bold text-xs sm:text-sm rounded-lg hover:bg-[#b91c1c] transition-colors w-[140px] h-[40px] flex items-center justify-center border-none outline-none",
              allowedContent: "hidden" // Completely destroys the "Image 4MB" text
            }}
            content={{
              button({ ready, isUploading }) {
                if (isUploading) return "Uploading...";
                if (ready) return "Upload Image"; 
                return "Loading...";
              },
            }}
            onClientUploadComplete={async (res) => {
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
    </div>
  );
}