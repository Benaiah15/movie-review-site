"use client";

import { UploadButton } from "@/lib/uploadthing";
import "@uploadthing/react/styles.css"; // Required to hide the ugly browser input
import { UserCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AvatarUpload({ currentImage }: { currentImage: string | null }) {
  const { update } = useSession();
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full max-w-full overflow-hidden">
      
      {/* Avatar Preview */}
      <div className="w-24 h-24 rounded-full dark:bg-zinc-800 bg-gray-100 border-2 dark:border-zinc-700 border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
        {currentImage ? (
          <img src={currentImage} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <UserCircle size={48} className="dark:text-zinc-500 text-zinc-400" />
        )}
      </div>

      {/* Text & Button Container */}
      <div className="flex flex-col items-center sm:items-start w-full min-w-0">
        <h3 className="dark:text-white text-zinc-900 font-bold text-lg mb-2 sm:mb-3 text-center sm:text-left transition-colors">Profile Avatar</h3>
        
        {/* We let the component just be itself, and we will style it in globals.css */}
        <UploadButton
          endpoint="avatarUploader"
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
            if (typeof window !== "undefined") window.location.reload();
          }}
          onUploadError={(error: Error) => {
            alert(`Upload Failed: ${error.message}`);
          }}
        />
      </div>
    </div>
  );
}