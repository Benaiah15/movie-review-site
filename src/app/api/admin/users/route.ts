import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

// Fetch all users for the dashboard
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.name !== "Admin") return new NextResponse("Unauthorized", { status: 401 });

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true, image: true, level: true, xp: true,
      _count: { select: { reviews: true, followers: true } }
    }
  });
  return NextResponse.json(users);
}

// Delete a user
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.name !== "Admin") return new NextResponse("Unauthorized", { status: 401 });

    const { userId } = await req.json();

    // Protection layer to ensure the Master Admin can NEVER be deleted
    const userToDelete = await db.user.findUnique({ where: { id: userId } });
    if (userToDelete?.email === process.env.MASTER_ADMIN_EMAIL) {
      return new NextResponse("Action Denied: Cannot delete the Master Admin account.", { status: 400 });
    }

    await db.user.delete({ where: { id: userId } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("USER_DELETE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}