import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tmdbId, title, overview, release_date, poster_path, vote_average } = body;

    // 1. Check if movie already exists to prevent duplicates
    const existingMovie = await db.movie.findUnique({
      where: { tmdbId: parseInt(tmdbId) }
    });

    if (existingMovie) {
      return NextResponse.json({ message: "Movie already imported" }, { status: 400 });
    }

    // 2. Save to our new SQLite database
    const newMovie = await db.movie.create({
      data: {
        tmdbId: parseInt(tmdbId),
        title: title,
        description: overview,
        releaseDate: release_date,
        posterPath: poster_path,
        rating: vote_average,
      },
    });

    return NextResponse.json(newMovie, { status: 201 });
  } catch (error) {
    console.error("Import Error:", error);
    return NextResponse.json({ error: "Failed to import movie" }, { status: 500 });
  }
}