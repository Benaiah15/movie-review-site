import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

const DUMMY_USERS = [
  { email: 'kino_king@test.com', name: 'KinoKing', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kino' },
  { email: 'horror_hound@test.com', name: 'HorrorHound', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hound' },
  { email: 'scifi_guy@test.com', name: 'SciFiGuy88', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SciFi' },
  { email: 'romcom_queen@test.com', name: 'RomComQueen', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Queen' },
  { email: 'critic_carl@test.com', name: 'CriticCarl', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carl' },
  { email: 'popcorn_muncher@test.com', name: 'PopcornMuncher', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Popcorn' },
  { email: 'a24_fanatic@test.com', name: 'A24Fanatic', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=A24' },
  { email: 'blockbuster_bro@test.com', name: 'BlockbusterBro', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bro' },
  { email: 'indie_darling@test.com', name: 'IndieDarling', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Indie' },
  { email: 'film_student_steve@test.com', name: 'FilmStudentSteve', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Steve' },
  { email: 'casual_watcher@test.com', name: 'JustWatching', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Casual' },
  { email: 'imax_only@test.com', name: 'IMAX_Or_Bust', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Imax' },
];

const REVIEW_TEMPLATES = [
  { rating: 5, content: "Absolute masterpiece. The cinematography was breathtaking." },
  { rating: 5, content: "Instant classic. The director really outdid themselves here." },
  { rating: 4.5, content: "Incredible visual effects. You absolutely have to see this." },
  { rating: 4, content: "Really great watch. The third act dragged a tiny bit." },
  { rating: 4, content: "Solid movie! The soundtrack absolutely carried it." },
  { rating: 3.5, content: "A bit uneven, but the action sequences were top-tier." },
  { rating: 3, content: "It was okay. Had some really great moments but overall forgettable." },
  { rating: 2.5, content: "Great concept, terrible execution. Pacing was all over the place." },
  { rating: 2, content: "I really wanted to like this, but I kept checking my watch." },
  { rating: 1, content: "Two hours of my life I will never get back. An absolute mess." },
];

const COMMENT_TEMPLATES = [
  "Totally agree with this.", "Spot on! I was thinking the exact same thing.",
  "I actually completely disagree, I thought the pacing was perfect.", "Great review.",
];

const COLLECTION_NAMES = [
  "Literally Me", "Weekend Vibes", "Masterpieces", "Guilty Pleasures", 
  "Pure Cinema", "Late Night Watches", "Mind-Bending", "Overrated Trash"
];

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return new NextResponse("Forbidden - Admin Only", { status: 403 });
  }

  const adminId = (session.user as any).id;

  try {
    // 1. SEED USERS
    const createdUsers = [];
    for (const user of DUMMY_USERS) {
      const dbUser = await db.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          email: user.email, name: user.name, image: user.image, role: "USER",
          xp: Math.floor(Math.random() * 800) + 150, level: Math.floor(Math.random() * 8) + 2,
        }
      });
      createdUsers.push(dbUser);
    }

    // 2. SOCIAL GRAPH
    for (const dummy of createdUsers) {
      try {
        await db.follow.create({ data: { followerId: dummy.id, followingId: adminId } });
        await db.notification.create({
          data: {
            userId: adminId, actorId: dummy.id, type: "FOLLOW",
            message: `${dummy.name} started following you.`, link: `/user/${dummy.id}` // <-- FIXED LINK
          }
        });
      } catch (e) {}

      const numFriendsToFollow = Math.floor(Math.random() * 5) + 4; 
      const friends = [...createdUsers].sort(() => 0.5 - Math.random()).slice(0, numFriendsToFollow);
      for (const friend of friends) {
        if (dummy.id !== friend.id) {
          try { await db.follow.create({ data: { followerId: dummy.id, followingId: friend.id } }); } catch (e) {}
        }
      }
    }

    // 3. FETCH MOVIES
    let allMovies: any[] = [];
    for (let page = 1; page <= 3; page++) {
      const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=${page}`);
      const data = await res.json();
      allMovies = [...allMovies, ...data.results];
    }

    // 4. INJECT MOVIES, REVIEWS, & LIKES
    const dbMovies = []; // Keep track of the actual database movies
    for (const tmdbMovie of allMovies) {
      const movie = await db.movie.upsert({
        where: { tmdbId: tmdbMovie.id },
        update: {},
        create: {
          tmdbId: tmdbMovie.id, title: tmdbMovie.title, description: tmdbMovie.overview,
          releaseDate: tmdbMovie.release_date, posterPath: tmdbMovie.poster_path,
          backdropPath: tmdbMovie.backdrop_path, rating: tmdbMovie.vote_average, isPublished: true,
        }
      });
      dbMovies.push(movie);

      const numReviews = Math.floor(Math.random() * Math.random() * 8);
      if (numReviews === 0) continue; 

      const shuffledUsers = [...createdUsers].sort(() => 0.5 - Math.random()).slice(0, numReviews);

      for (const user of shuffledUsers) {
        const randomReview = REVIEW_TEMPLATES[Math.floor(Math.random() * REVIEW_TEMPLATES.length)];
        const review = await db.review.create({
          data: { movieId: movie.id, userId: user.id, rating: randomReview.rating, content: randomReview.content }
        });

        // Upvotes
        const numReviewLikes = Math.floor(Math.random() * 6);
        const reviewLikers = [...createdUsers].sort(() => 0.5 - Math.random()).slice(0, numReviewLikes);
        for (const liker of reviewLikers) {
          if (liker.id !== user.id) {
            try { await db.reviewLike.create({ data: { reviewId: review.id, userId: liker.id } }); } catch (e) {}
          }
        }

        // Comments
        if (Math.random() > 0.6) {
          const numComments = Math.floor(Math.random() * 3) + 1;
          const commenters = [...createdUsers].sort(() => 0.5 - Math.random()).slice(0, numComments);
          
          for (const commenter of commenters) {
            if (commenter.id === user.id) continue; 
            const randomCommentText = COMMENT_TEMPLATES[Math.floor(Math.random() * COMMENT_TEMPLATES.length)];
            await db.comment.create({ data: { reviewId: review.id, userId: commenter.id, content: randomCommentText } });
          }
        }
      }
    }

    // 5. EMBELLISH PROFILES (Top 4, Watchlist, Collections)
    for (const dummy of createdUsers) {
      // Shuffle all movies to give them random selections
      const shuffledMovies = [...dbMovies].sort(() => 0.5 - Math.random());

      // Top 4 (70% chance they have pinned their top 4 movies)
      if (Math.random() > 0.3 && shuffledMovies.length >= 4) {
        const top4 = shuffledMovies.slice(0, 4);
        await db.user.update({
          where: { id: dummy.id },
          data: { topFourMovies: { connect: top4.map(m => ({ id: m.id })) } }
        });
      }

      // Watchlist (They all have random watchlists of 2 to 15 movies)
      const watchlistSize = Math.floor(Math.random() * 14) + 2;
      const watchlist = shuffledMovies.slice(4, 4 + watchlistSize); // Offset to not match Top 4
      if (watchlist.length > 0) {
        await db.user.update({
          where: { id: dummy.id },
          data: { favoriteMovies: { connect: watchlist.map(m => ({ id: m.id })) } }
        });
      }

      // Collections (50% chance they have 1 or 2 curated collections)
      if (Math.random() > 0.5) {
        const numCollections = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numCollections; i++) {
          const colName = COLLECTION_NAMES[Math.floor(Math.random() * COLLECTION_NAMES.length)];
          const colSize = Math.floor(Math.random() * 6) + 3; // 3 to 8 movies in the collection
          const colMovies = [...dbMovies].sort(() => 0.5 - Math.random()).slice(0, colSize);

          await db.collection.create({
            data: {
              name: colName,
              description: "Just a few of my absolute favorites.",
              userId: dummy.id,
              movies: { connect: colMovies.map(m => ({ id: m.id })) }
            }
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: `🚀 PROFILES EMBELLISHED! Watchlists, Top 4s, and Collections generated.` });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}