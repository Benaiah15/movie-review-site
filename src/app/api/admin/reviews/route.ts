import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

// Fetch all reviews AND their nested comments
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.name !== "Admin") return new NextResponse("Unauthorized", { status: 401 });

  const reviews = await db.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true, image: true } },
      movie: { select: { title: true } },
      // Fetch the comments attached to this review
      comments: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'asc' }
      }
    }
  });
  return NextResponse.json(reviews);
}

// Delete a review OR a comment
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.name !== "Admin") return new NextResponse("Unauthorized", { status: 401 });

    const { reviewId, commentId } = await req.json();

    // If a commentId was passed, delete ONLY the comment
    if (commentId) {
      await db.comment.delete({ where: { id: commentId } });
      return NextResponse.json({ success: true });
    }

    // Otherwise, delete the main review
    if (!reviewId) return new NextResponse("Review ID required", { status: 400 });

    await db.review.delete({ where: { id: reviewId } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}