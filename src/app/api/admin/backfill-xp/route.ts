import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Security Check: Only the Master Admin can run this script
    if (session?.user?.name !== "Admin") {
      return new NextResponse("Unauthorized. Only Admins can run this script.", { status: 401 });
    }

    // 1. Fetch all users and count their existing reviews
    const users = await db.user.findMany({
      include: {
        _count: {
          select: { reviews: true }
        }
      }
    });

    let updatedCount = 0;

    // 2. Loop through every user and calculate their retro-active XP
    for (const user of users) {
      // Base 50 XP (for registering) + 20 XP for every review they've already written
      const calculatedXp = 50 + (user._count.reviews * 20);
      
      // Calculate the correct level
      const calculatedLevel = Math.floor(calculatedXp / 100) + 1;

      // Update the user in the database
      await db.user.update({
        where: { id: user.id },
        data: {
          xp: calculatedXp,
          level: calculatedLevel
        }
      });

      updatedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully backfilled XP and Levels for ${updatedCount} users!` 
    });

  } catch (error) {
    console.error("BACKFILL_ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}