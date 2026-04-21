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

    // Unwrap the dynamic route parameter
    const resolvedParams = await params;
    const reviewId = resolvedParams.reviewId;
    const userId = session.user.id;

    // Check if the user already liked this specific review
    const existingLike = await db.reviewLike.findUnique({
      where: {
        reviewId_userId: {
          reviewId: reviewId,
          userId: userId,
        },
      },
    });

    if (existingLike) {
      // If they already liked it, clicking the button again removes the like
      await db.reviewLike.delete({
        where: {
          id: existingLike.id,
        },
      });
      return NextResponse.json({ liked: false }, { status: 200 });
    } else {
      // If they haven't liked it, create a new like
      await db.reviewLike.create({
        data: {
          reviewId: reviewId,
          userId: userId,
        },
      });
      return NextResponse.json({ liked: true }, { status: 200 });
    }
  } catch (error) {
    console.error("Like error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}