import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Security check: Must be logged in
    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, bio } = body;

    // Update the user in the database
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: { 
        name: name || null, 
        bio: bio || null 
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Settings update error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}