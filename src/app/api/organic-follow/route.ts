import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const userId = (session.user as any).id;

    const dummyUsers = await db.user.findMany({
      where: { email: { endsWith: '@test.com' } }
    });

    if (dummyUsers.length === 0) return NextResponse.json({ success: true });

    const randomDummy = dummyUsers[Math.floor(Math.random() * dummyUsers.length)];

    try {
      await db.follow.create({
        data: { followerId: randomDummy.id, followingId: userId }
      });

      await db.notification.create({
        data: {
          userId: userId, actorId: randomDummy.id, type: "FOLLOW",
          message: `${randomDummy.name} just started following you!`, link: `/profile/${randomDummy.id}`
        }
      });
    } catch (e) {
      // Already follows, ignore
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Error", { status: 500 });
  }
}