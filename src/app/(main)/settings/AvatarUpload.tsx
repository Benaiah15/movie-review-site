"use client";

import { UploadButton } from "@/lib/uploadthing";
import { UserCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AvatarUpload({ currentImage }: { currentImage: string | null }) {
  const { update } = useSession();
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row items-center md:items-center gap-6 w-full max-w-full overflow-hidden">
      
      {/* Avatar Preview */}
      <div className="w-24 h-24 rounded-full dark:bg-zinc-800 bg-gray-100 border-2 dark:border-zinc-700 border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
        {currentImage ? (
          <img src={currentImage} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <UserCircle size={48} className="dark:text-zinc-500 text-zinc-400" />
        )}
      </div>

      {/* Upload Component */}
      <div className="flex flex-col items-center md:items-start w-full min-w-0">
        <h3 className="dark:text-white text-zinc-900 font-bold text-lg mb-3 text-center md:text-left">Profile Avatar</h3>
        
        <div className="w-full flex justify-center md:justify-start">
          <UploadButton
            endpoint="avatarUploader"
            appearance={{
              // The '!' forces Tailwind to override UploadThing's stubborn default CSS
              button: "!bg-red-600 hover:!bg-red-700 !text-white !font-bold !text-sm !px-6 !py-2 !rounded-lg !w-auto !border-none !outline-none !cursor-pointer !transition-colors",
              container: "!w-auto !flex-row !m-0 !p-0",
              allowedContent: "!hidden" // Completely obliterates the "Image 4MB" text
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