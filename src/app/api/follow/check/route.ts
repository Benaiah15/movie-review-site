import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ isFollowing: false });

    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get("targetId");

    if (!targetId) return NextResponse.json({ isFollowing: false });

    const currentUser = await db.user.findUnique({ where: { email: session.user.email } });
    if (!currentUser) return NextResponse.json({ isFollowing: false });

    const follow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetId
        }
      }
    });

    return NextResponse.json({ isFollowing: !!follow });
  } catch (error) {
    return NextResponse.json({ isFollowing: false });
  }
}