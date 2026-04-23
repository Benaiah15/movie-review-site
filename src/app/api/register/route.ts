import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Ensure the user is actually logged in
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { movieId, rating, content } = body;

    if (!movieId || !rating || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // 1. Save the review to the database
    const review = await db.review.create({
      data: {
        movieId,
        rating,
        content,
        userId,
      },
    });

    // 2. THE GAMIFICATION ENGINE: Update XP and Level
    const currentUser = await db.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true }
    });

    if (currentUser) {
      const newXp = currentUser.xp + 20; // Award 20 XP per review
      
      // Calculate new level (Level 1 = 0-99 XP, Level 2 = 100-199 XP, etc.)
      const calculatedLevel = Math.floor(newXp / 100) + 1; 

      await db.user.update({
        where: { id: userId },
        data: {
          xp: newXp,
          // Only update the level if the math shows they actually leveled up
          level: calculatedLevel > currentUser.level ? calculatedLevel : currentUser.level
        }
      });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("REVIEW_POST_ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}