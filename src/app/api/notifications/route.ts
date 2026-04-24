import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

// Fetch notifications
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const currentUser = await db.user.findUnique({ where: { email: session.user.email } });
    if (!currentUser) return new NextResponse("Unauthorized", { status: 401 });

    const notifications = await db.notification.findMany({
      where: { userId: currentUser.id },
      orderBy: { createdAt: 'desc' },
      take: 20, // Only fetch the 20 most recent to keep it fast
      include: {
        actor: { select: { name: true, image: true } }
      }
    });

    return NextResponse.json(notifications);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Mark all as read
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const currentUser = await db.user.findUnique({ where: { email: session.user.email } });
    if (!currentUser) return new NextResponse("Unauthorized", { status: 401 });

    await db.notification.updateMany({
      where: { userId: currentUser.id, isRead: false },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}