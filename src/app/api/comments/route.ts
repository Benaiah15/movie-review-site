import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { containsProfanity } from "@/lib/profanityFilter";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { reviewId, content, parentId } = body;

    if (!reviewId || !content) {
      return new NextResponse("Missing data", { status: 400 });
    }

    if (containsProfanity(content)) {
      return new NextResponse("Your reply contains inappropriate language. Please keep the community respectful.", { status: 400 });
    }

    // Fetch the review to get the owner and movieId
    const review = await db.review.findUnique({
      where: { id: reviewId },
      select: { userId: true, movieId: true }
    });

    const comment = await db.comment.create({
      data: {
        content,
        reviewId,
        userId: session.user.id,
        parentId: parentId || null, 
      }
    });

    // THE FIX: Trigger Notification (if they aren't replying to themselves)
    if (review && review.userId !== session.user.id) {
      await db.notification.create({
        data: {
          userId: review.userId,
          actorId: session.user.id,
          type: "COMMENT",
          message: `replied to your review: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
          link: `/movie/${review.movieId}`
        }
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Comment creation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}