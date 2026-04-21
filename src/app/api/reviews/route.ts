import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Security check: Must be logged in
    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { movieId, rating, content } = body;

    if (!movieId || !rating || !content) {
      return new NextResponse("Missing data", { status: 400 });
    }

    // Save to database
    const review = await db.review.create({
      data: {
        rating,
        content,
        movieId,
        userId: session.user.id,
      }
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Review creation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}