import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Security: Must be logged in
    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { movieId } = await request.json();

    if (!movieId) {
      return new NextResponse("Missing Movie ID", { status: 400 });
    }

    // Fetch the user to check their current watchlist
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { favoriteMovies: true }
    });

    // Check if the movie is already saved
    const isFavorited = user?.favoriteMovies.some(movie => movie.id === movieId);

    if (isFavorited) {
      // Remove from watchlist
      await db.user.update({
        where: { id: session.user.id },
        data: { favoriteMovies: { disconnect: { id: movieId } } }
      });
      return NextResponse.json({ saved: false }, { status: 200 });
    } else {
      // Add to watchlist
      await db.user.update({
        where: { id: session.user.id },
        data: { favoriteMovies: { connect: { id: movieId } } }
      });
      return NextResponse.json({ saved: true }, { status: 200 });
    }
  } catch (error) {
    console.error("Watchlist Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}