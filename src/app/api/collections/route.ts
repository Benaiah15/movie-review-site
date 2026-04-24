import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

// Fetch all collections for the logged-in user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const collections = await db.collection.findMany({
      where: { userId: session.user.id },
      include: { movies: { select: { id: true } } }, // Fetch IDs to check if movie is in collection
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(collections);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Handle Creating Collections & Toggling Movies
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { action, name, collectionId, movieId } = await req.json();

    // ACTION 1: Create a brand new collection
    if (action === "CREATE") {
      if (!name) return new NextResponse("Name required", { status: 400 });
      const collection = await db.collection.create({
        data: { name, userId: session.user.id }
      });
      return NextResponse.json(collection);
    }

    // ACTION 2: Add or Remove a movie from a collection
    if (action === "TOGGLE" && collectionId && movieId) {
      const collection = await db.collection.findUnique({
        where: { id: collectionId },
        include: { movies: { where: { id: movieId } } }
      });

      if (!collection) return new NextResponse("Not found", { status: 404 });

      const hasMovie = collection.movies.length > 0;

      if (hasMovie) {
        // Remove it
        await db.collection.update({
          where: { id: collectionId },
          data: { movies: { disconnect: { id: movieId } } }
        });
      } else {
        // Add it
        await db.collection.update({
          where: { id: collectionId },
          data: { movies: { connect: { id: movieId } } }
        });
      }
      return NextResponse.json({ success: true, added: !hasMovie });
    }

    return new NextResponse("Invalid action", { status: 400 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}