import { PrismaClient } from '@prisma/client';
import "dotenv/config";

const db = new PrismaClient();

// 1. THE DUMMY COMMUNITY (12 Unique Users)
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

// 2. THE REVIEW MATRIX (Realistic, varied opinions)
const REVIEW_TEMPLATES = [
  { rating: 5, content: "Absolute masterpiece. The cinematography was breathtaking and the pacing was perfect. I will be thinking about this for weeks." },
  { rating: 5, content: "I could watch this 100 times and never get bored. Instant classic. The director really outdid themselves here." },
  { rating: 5, content: "Lived up to the hype and then some. The script was incredibly tight and the performances were universally stellar." },
  { rating: 4.5, content: "Incredible visual effects and sound design. You absolutely have to see this in theaters with a good sound system." },
  { rating: 4, content: "Really great watch. The third act dragged a tiny bit, but the emotional payoff at the end was completely worth it." },
  { rating: 4, content: "Solid movie! The soundtrack absolutely carried a few of the slower scenes. Would highly recommend." },
  { rating: 4, content: "Surprisingly good! I went in with low expectations but the lead actor totally carried the film." },
  { rating: 3.5, content: "A bit uneven, but the action sequences were top-tier. Good popcorn flick to turn your brain off to." },
  { rating: 3, content: "It was okay. Had some really great moments but overall a bit forgettable compared to the director's older work." },
  { rating: 3, content: "Beautiful to look at, but the script felt a bit empty. Style over substance for sure." },
  { rating: 2.5, content: "Great concept, terrible execution. The pacing was all over the place and the ending felt totally rushed." },
  { rating: 2, content: "I really wanted to like this, but I kept checking my watch. Just painfully slow." },
  { rating: 1, content: "What a massive disappointment. The trailer completely lied about what kind of movie this was." },
  { rating: 1, content: "Two hours of my life I will never get back. An absolute mess from start to finish." },
];

async function main() {
  console.log("🌱 Starting the Mega-Seeder...");

  // 1. SEED USERS
  console.log("👤 Creating a community of 12 active users...");
  const createdUsers = [];
  for (const user of DUMMY_USERS) {
    const dbUser = await db.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        image: user.image,
        role: "USER",
        xp: Math.floor(Math.random() * 800) + 150, // Massive XP variations for a realistic leaderboard
        level: Math.floor(Math.random() * 8) + 2,
      }
    });
    createdUsers.push(dbUser);
  }

  // 2. FETCH 60 MOVIES (Pages 1, 2, and 3 from TMDB)
  console.log("🎬 Fetching the top 60 global movies from TMDB...");
  let allMovies: any[] = [];
  
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=${page}`);
    const data = await res.json();
    allMovies = [...allMovies, ...data.results];
  }

  console.log(`✅ Fetched ${allMovies.length} movies. Writing reviews...`);

  // 3. INJECT MOVIES AND REVIEWS
  for (const tmdbMovie of allMovies) {
    // Save movie to DB
    const movie = await db.movie.upsert({
      where: { tmdbId: tmdbMovie.id },
      update: {},
      create: {
        tmdbId: tmdbMovie.id,
        title: tmdbMovie.title,
        description: tmdbMovie.overview,
        releaseDate: tmdbMovie.release_date,
        posterPath: tmdbMovie.poster_path,
        backdropPath: tmdbMovie.backdrop_path,
        rating: tmdbMovie.vote_average,
        isPublished: true,
      }
    });

    // Decide randomly how many reviews this movie gets (between 1 and 6)
    const numReviews = Math.floor(Math.random() * 6) + 1;
    
    // Pick random users to leave the reviews
    const shuffledUsers = [...createdUsers].sort(() => 0.5 - Math.random()).slice(0, numReviews);

    for (const user of shuffledUsers) {
      const randomReview = REVIEW_TEMPLATES[Math.floor(Math.random() * REVIEW_TEMPLATES.length)];
      
      await db.review.create({
        data: {
          movieId: movie.id,
          userId: user.id,
          rating: randomReview.rating,
          content: randomReview.content,
        }
      });
    }
  }

  console.log("🚀 MEGA-SEED COMPLETE! Your platform is now fully populated with 60 movies and hundreds of active reviews.");
}

main()
  .catch(e => console.error("SEEDING ERROR:", e))
  .finally(async () => await db.$disconnect());