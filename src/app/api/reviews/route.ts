import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";
import { containsProfanity } from "@/lib/profanityFilter";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { movieId, rating, content } = body;

    if (!movieId || !rating || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // THE FIX: Profanity Filter Check
    if (containsProfanity(content)) {
      return new NextResponse("Your review contains inappropriate language. Please keep the community respectful.", { status: 400 });
    }

    // Save the review
    const review = await db.review.create({
      data: { movieId, rating, content, userId },
    });

    // Update XP and Level
    const currentUser = await db.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true }
    });

    if (currentUser) {
      const newXp = currentUser.xp + 20; 
      const calculatedLevel = Math.floor(newXp / 100) + 1; 

      await db.user.update({
        where: { id: userId },
        data: {
          xp: newXp,
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