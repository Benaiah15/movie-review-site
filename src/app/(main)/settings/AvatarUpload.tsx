"use client";

import { UploadDropzone } from "@/lib/uploadthing";
// We DO NOT import the default styles here, as they override our button look
import { UserCircle, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AvatarUpload({ currentImage }: { currentImage: string | null }) {
  const { update } = useSession();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="flex flex-col md:flex-row items-center md:items-center gap-6 w-full max-w-full overflow-hidden">
      
      {/* Avatar Preview */}
      <div className="w-24 h-24 rounded-full dark:bg-zinc-800 bg-gray-100 border-2 dark:border-zinc-700 border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm relative transition-colors">
        {currentImage ? (
          <img src={currentImage} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <UserCircle size={48} className="dark:text-zinc-500 text-zinc-400" />
        )}
        {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
                <Loader2 className="animate-spin text-white" size={24} />
            </div>
        )}
      </div>

      {/* Text & Button Container */}
      <div className="flex flex-col items-center md:items-start w-full min-w-0">
        <h3 className="dark:text-white text-zinc-900 font-bold text-lg mb-3 text-center md:text-left transition-colors">Profile Avatar</h3>
        
        <div className="w-full flex justify-center md:justify-start relative">
          {/* CRITICAL FIX: We switched to UploadDropzone to eliminate the native browser text bleed.
              We style it strictly to look exactly like our intended button. */}
          <UploadDropzone
            endpoint="avatarUploader"
            onUploadBegin={() => setIsUploading(true)}
            appearance={{
              // Style the entire dropzone area as a compact button
              container: "border-none p-0 m-0 w-auto h-auto flex flex-col items-center cursor-pointer bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors shadow-sm focus-within:ring-2 focus-within:ring-red-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-zinc-950",
              
              // This is the inner text area
              label: "text-white font-bold text-sm m-0 p-0 pointer-events-none",
              
              // Force hide ALL other default UploadThing components that might confuse the UI
              uploadIcon: "hidden", 
              allowedContent: "hidden",
              button: "hidden", 
            }}
            content={{
              // We force the text to only be "Upload Image" across all views
              label: isUploading ? "Uploading..." : "Upload Image"
            }}
            onClientUploadComplete={async () => {
              setIsUploading(false);
              await update();
              router.refresh();
              // A clean reload is often necessary to update the session-based header avatar
              if (typeof window !== "undefined") {
                window.location.reload();
              }
            }}
            onUploadError={(error: Error) => {
              setIsUploading(false);
              alert(`Upload Failed: ${error.message}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}