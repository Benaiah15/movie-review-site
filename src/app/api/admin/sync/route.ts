import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Find the Master Admin
    const admin = await db.user.findFirst({ where: { level: 100 } });
    if (!admin) return new NextResponse("Admin not found", { status: 404 });

    // 2. Find all users who are NOT the admin
    const allUsers = await db.user.findMany({
      where: { id: { not: admin.id } }
    });

    // 3. Force them all to follow the admin (Prisma ignores duplicates if setup right, or you can use an upsert)
    let syncedCount = 0;
    for (const user of allUsers) {
      const existingFollow = await db.follow.findFirst({
        where: { followerId: user.id, followingId: admin.id }
      });

      if (!existingFollow) {
        await db.follow.create({
          data: { followerId: user.id, followingId: admin.id }
        });
        syncedCount++;
      }
    }

    return NextResponse.json({ message: `Successfully synced ${syncedCount} old users!` });
  } catch (error) {
    return new NextResponse("Error syncing", { status: 500 });
  }
}