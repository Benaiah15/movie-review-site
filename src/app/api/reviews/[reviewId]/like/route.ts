import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Security check: Must be logged in to like a review
    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;
    const reviewId = resolvedParams.reviewId;
    const userId = session.user.id;

    // Fetch the review to see who owns it
    const review = await db.review.findUnique({
      where: { id: reviewId },
      select: { userId: true, movieId: true }
    });

    if (!review) return new NextResponse("Review not found", { status: 404 });

    const existingLike = await db.reviewLike.findUnique({
      where: { reviewId_userId: { reviewId: reviewId, userId: userId } },
    });

    if (existingLike) {
      await db.reviewLike.delete({ where: { id: existingLike.id } });
      return NextResponse.json({ liked: false }, { status: 200 });
    } else {
      await db.reviewLike.create({
        data: { reviewId: reviewId, userId: userId },
      });

      // THE FIX: Trigger Notification (if they aren't liking their own review!)
      if (review.userId !== userId) {
        await db.notification.create({
          data: {
            userId: review.userId, 
            actorId: userId,
            type: "LIKE",
            message: "upvoted your movie review.",
            link: `/movie/${review.movieId}`
          }
        });
      }

      return NextResponse.json({ liked: true }, { status: 200 });
    }
  } catch (error) {
    console.error("Like error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}