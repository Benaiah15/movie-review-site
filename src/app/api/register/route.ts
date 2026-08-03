import bcrypt from "bcrypt";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new NextResponse("Missing information", { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });

    if (existingUser) {
      if (!existingUser.hashedPassword) {
        return new NextResponse("Email linked to a Google Account. Please sign in with Google.", { status: 400 });
      }
      return new NextResponse("Email already in use", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // 1. Create user with starting XP
    const user = await db.user.create({
      data: { name, email, hashedPassword, xp: 50, level: 1 }
    });

    // 2. Find Master Admin (fallback to level 100 if env var is missing)
    const adminEmail = process.env.MASTER_ADMIN_EMAIL;
    const admin = adminEmail 
      ? await db.user.findUnique({ where: { email: adminEmail } })
      : await db.user.findFirst({ where: { level: 100 } });

    if (admin) {
      // Create Auto-Follow relationship
      await db.follow.create({
        data: { followerId: user.id, followingId: admin.id }
      }).catch(() => null);

        await db.notification.create({
              data: {
                userId: admin.id, // Notification belongs to Admin
                actorId: user.id, // The new user who just registered
                message: `${user.name || "A new user"} started following you.`,
                type: "FOLLOW",
                link: `/profile/${user.name || user.id}` // A link back to the new user's profile
              }
            }).catch(() => null);
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("REGISTER_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}