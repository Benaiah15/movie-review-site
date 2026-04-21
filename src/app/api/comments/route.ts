import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Security check: Must be logged in to reply
    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { reviewId, content, parentId } = body;

    if (!reviewId || !content) {
      return new NextResponse("Missing data", { status: 400 });
    }

    // Save the reply to the database
    const comment = await db.comment.create({
      data: {
        content,
        reviewId,
        userId: session.user.id,
        parentId: parentId || null, // This links it to another comment if it's a deep thread
      }
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Comment creation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}