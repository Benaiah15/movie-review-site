import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

const f = createUploadthing();

export const ourFileRouter = {
  // Define an endpoint specifically for avatar uploads
  avatarUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    // The middleware runs BEFORE the upload starts to check security
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      
      // If they aren't logged in, block the upload
      if (!session || !session.user?.id) {
        throw new Error("Unauthorized");
      }
      
      // Pass the user ID to the next step
      return { userId: session.user.id };
    })
    // This runs immediately AFTER the upload to UploadThing is successful
    .onUploadComplete(async ({ metadata, file }) => {
      // Update the user's profile in the database with the new image URL
      await db.user.update({
        where: { id: metadata.userId },
        data: { image: file.url },
      });

      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;