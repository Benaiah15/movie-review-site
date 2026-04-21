import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;
    const movieId = resolvedParams.id;
    const userId = session.user.id;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { topFourMovies: true },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    const isAlreadyTopFour = user.topFourMovies.some((m) => m.id === movieId);

    if (isAlreadyTopFour) {
      // Remove it from the Top 4
      await db.user.update({
        where: { id: userId },
        data: { topFourMovies: { disconnect: { id: movieId } } },
      });
      return NextResponse.json({ pinned: false });
    } else {
      // Check the limit before adding
      if (user.topFourMovies.length >= 4) {
        return new NextResponse("Top 4 is full. Remove a movie first.", { status: 400 });
      }
      await db.user.update({
        where: { id: userId },
        data: { topFourMovies: { connect: { id: movieId } } },
      });
      return NextResponse.json({ pinned: true });
    }
  } catch (error) {
    console.error("Top 4 toggle error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}