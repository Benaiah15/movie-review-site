import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const movieId = searchParams.get("movieId");

    if (!session?.user?.email || !movieId) return NextResponse.json({ isSaved: false });

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ isSaved: false });

    const movie = await db.movie.findFirst({
      where: { id: movieId, favoritedBy: { some: { id: user.id } } }
    });

    return NextResponse.json({ isSaved: !!movie });
  } catch (error) {
    return NextResponse.json({ isSaved: false });
  }
}