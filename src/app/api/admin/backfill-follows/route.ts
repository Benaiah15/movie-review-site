import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Security Check: Only the Master Admin can run this script
    if (session?.user?.name !== "Admin") {
      return new NextResponse("Unauthorized. Only Admins can run this script.", { status: 401 });
    }

    // Find the master admin account in the database
    const adminEmail = process.env.MASTER_ADMIN_EMAIL;
    if (!adminEmail) {
      return new NextResponse("Master Admin Email not found in Environment Variables", { status: 400 });
    }

    const adminUser = await db.user.findUnique({ where: { email: adminEmail } });
    if (!adminUser) {
      return new NextResponse("Admin account not found in database", { status: 404 });
    }

    // Fetch all users EXCEPT the admin
    const allUsers = await db.user.findMany({
      where: { 
        id: { not: adminUser.id } 
      }
    });

    let newFollowersCount = 0;

    // Loop through and connect them
    for (const user of allUsers) {
      // Check if they are already following to avoid database crashes
      const existingFollow = await db.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: adminUser.id
          }
        }
      });

      // If they don't follow the admin yet, create the connection
      if (!existingFollow) {
        await db.follow.create({
          data: {
            followerId: user.id,
            followingId: adminUser.id
          }
        });
        newFollowersCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully forced ${newFollowersCount} existing users to follow the Admin account!` 
    });

  } catch (error) {
    console.error("BACKFILL_FOLLOWS_ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}