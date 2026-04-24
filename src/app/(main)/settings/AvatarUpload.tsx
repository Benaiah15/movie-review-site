"use client";

import { UploadButton } from "@/lib/uploadthing";
import "@uploadthing/react/styles.css"; // Required to hide the ugly native HTML input text
import { UserCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AvatarUpload({ currentImage }: { currentImage: string | null }) {
  const { update } = useSession();
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6 w-full max-w-full overflow-hidden">
      
      {/* Avatar Preview */}
      <div className="w-24 h-24 rounded-full dark:bg-zinc-800 bg-gray-100 border-2 dark:border-zinc-700 border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm transition-colors">
        {currentImage ? (
          <img src={currentImage} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <UserCircle size={48} className="dark:text-zinc-500 text-zinc-400" />
        )}
      </div>

      {/* Text & Button Container */}
      <div className="flex flex-col items-center md:items-start w-full min-w-0">
        <h3 className="dark:text-white text-zinc-900 font-bold text-lg mb-2 md:mb-3 text-center md:text-left transition-colors">Profile Avatar</h3>
        
        {/* THE ULTIMATE FIX: 
            We wrap the standard UploadButton in a div and force the styling using Tailwind parent selectors.
            This guarantees it is Red, hides the 4MB text, centers on mobile, and left-aligns on desktop,
            all without breaking UploadThing's internal click functionality!
        */}
        <div className="w-full flex justify-center md:justify-start 
            [&_.ut-button]:bg-red-600 
            hover:[&_.ut-button]:bg-red-700 
            [&_.ut-button]:text-white 
            [&_.ut-button]:font-bold 
            [&_.ut-button]:text-sm 
            [&_.ut-button]:px-6 
            [&_.ut-button]:py-2 
            [&_.ut-button]:rounded-lg 
            [&_.ut-button]:transition-colors
            [&_.ut-button]:w-auto
            [&_.ut-button]:m-0
            [&_.ut-allowed-content]:hidden"
        >
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