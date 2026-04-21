import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Security check: Must be logged in to follow someone
    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Unwrap the dynamic route parameter to get the target user's ID
    const resolvedParams = await params;
    const targetUserId = resolvedParams.id;
    const currentUserId = session.user.id;

    // Prevent users from following themselves
    if (targetUserId === currentUserId) {
      return new NextResponse("You cannot follow yourself", { status: 400 });
    }

    // Check if the current user is already following the target user
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // If they already follow them, clicking again UNFOLLOWS them
      await db.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId,
          },
        },
      });
      return NextResponse.json({ followed: false }, { status: 200 });
    } else {
      // If they don't follow them, create a new FOLLOW connection
      await db.follow.create({
        data: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      });
      return NextResponse.json({ followed: true }, { status: 200 });
    }
  } catch (error) {
    console.error("Follow API error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}