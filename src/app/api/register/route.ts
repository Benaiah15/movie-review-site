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
      // If they exist but have no password, they logged in with Google originally
      if (!existingUser.hashedPassword) {
        return new NextResponse("Email linked to a Google Account. Please sign in with Google.", { status: 400 });
      }
      return new NextResponse("Email already in use", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: { name, email, hashedPassword }
    });

    return NextResponse.json(user);
  } catch (error: any) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}