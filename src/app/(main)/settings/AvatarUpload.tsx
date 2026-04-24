"use client";

import { UserCircle, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
// THE NUCLEAR OPTION: We import the logic hook, NOT the UI button!
import { useUploadThing } from "@/lib/uploadthing";

export default function AvatarUpload({ currentImage }: { currentImage: string | null }) {
  const { update } = useSession();
  const router = useRouter();

  // We handle the upload logic completely manually now
  const { startUpload, isUploading } = useUploadThing("avatarUploader", {
    onClientUploadComplete: async () => {
      await update();
      router.refresh();
      if (typeof window !== "undefined") window.location.reload();
    },
    onUploadError: (error: Error) => {
      alert(`Upload Failed: ${error.message}`);
    },
  });

  // This catches the file when you pick it and sends it to UploadThing
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await startUpload([file]);
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 w-full max-w-full overflow-hidden">
      
      {/* Avatar Preview */}
      <div className="relative w-24 h-24 rounded-full dark:bg-zinc-800 bg-gray-100 border-2 dark:border-zinc-700 border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm transition-colors">
        {currentImage ? (
          <img src={currentImage} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <UserCircle size={48} className="dark:text-zinc-500 text-zinc-400" />
        )}
        
        {/* Adds a cool loading spinner over the image while uploading */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
            <Loader2 className="animate-spin text-white" size={24} />
          </div>
        )}
      </div>

      {/* Text & Custom Button Container */}
      <div className="flex flex-col items-center md:items-start w-full min-w-0">
        <h3 className="dark:text-white text-zinc-900 font-bold text-lg mb-3 text-center md:text-left transition-colors">Profile Avatar</h3>
        
        <div className="w-full flex justify-center md:justify-start">
          
          {/* 1. THE HIDDEN INPUT: This is the raw browser input, and we make it invisible */}
          <input
            type="file"
            id="custom-avatar-upload"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          
          {/* 2. THE CUSTOM BUTTON: This triggers the hidden input when clicked. 
                 It is 100% pure Tailwind CSS, so it cannot fail! */}
          <label
            htmlFor="custom-avatar-upload"
            className={`bg-red-600 text-white font-bold text-sm px-6 py-2 rounded-lg text-center transition-colors shadow-sm min-w-[140px] flex items-center justify-center select-none ${
              isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700 cursor-pointer"
            }`}
          >
            {isUploading ? "Uploading..." : "Upload Image"}
          </label>

        </div>
      </div>
    </div>
  );
}