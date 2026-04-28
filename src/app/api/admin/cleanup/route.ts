import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

export async function GET(req: Request) {
  // 1. THE SHIELD: Ensure only YOU can trigger this purge
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return new NextResponse("Forbidden - Admin Only", { status: 403 });
  }

  try {
    // 2. THE PURGE: Delete movies that have 0 interactions
    const result = await db.movie.deleteMany({
      where: {
        reviews: { none: {} },
        collections: { none: {} },
        favoritedBy: { none: {} },
        topFourUsers: { none: {} }
      }
    });

    // 3. THE RESULT: Tell us how many were destroyed
    return NextResponse.json({ 
      success: true, 
      message: `BOOM! Successfully purged ${result.count} ghost movies from the database.` 
    });
    
  } catch (error) {
    console.error("CLEANUP_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}