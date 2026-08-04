import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // <-- Fixed to expect 'id'
) {
  try {
    const session = await getServerSession(authOptions);
    const resolvedParams = await params;
    const movieId = resolvedParams.id; // <-- Fixed to read 'id'

    if (!session?.user?.email || !movieId) return NextResponse.json({ pinned: false });

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ pinned: false });

    const movie = await db.movie.findFirst({
      where: { id: movieId, topFourUsers: { some: { id: user.id } } }
    });

    return NextResponse.json({ pinned: !!movie });
  } catch (error) {
    return NextResponse.json({ pinned: false });
  }
}