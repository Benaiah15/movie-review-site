import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const currentUser = await db.user.findUnique({ where: { email: session.user.email }});
    if (!currentUser) return new NextResponse("Unauthorized", { status: 401 });

    const { targetUserId } = await req.json();
    if (currentUser.id === targetUserId) return new NextResponse("Cannot follow yourself", { status: 400 });

    const existingFollow = await db.follow.findUnique({
      where: { followerId_followingId: { followerId: currentUser.id, followingId: targetUserId } }
    });

    if (existingFollow) {
      await db.follow.delete({
        where: { followerId_followingId: { followerId: currentUser.id, followingId: targetUserId } }
      });
      return NextResponse.json({ following: false });
    } else {
      await db.follow.create({
        data: { followerId: currentUser.id, followingId: targetUserId }
      });

      // THE FIX: Trigger Notification!
      await db.notification.create({
        data: {
          userId: targetUserId,      // The person receiving the follow
          actorId: currentUser.id,   // The person clicking the button
          type: "FOLLOW",
          message: "started following you.",
          link: `/user/${currentUser.id}` // Clicking the notif takes them to the follower's profile
        }
      });

      return NextResponse.json({ following: true });
    }
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}