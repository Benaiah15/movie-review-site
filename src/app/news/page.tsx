import db from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Star, PlayCircle, TrendingUp, Flame, Heart, ChevronRight, Ticket, Users, Compass, Newspaper, Calendar } from "lucide-react";
import HeroSlideshow from "@/components/HeroSlideshow";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const revalidate = 60;
export const dynamic = "force-dynamic";

async function getTMDB(endpoint: string) {
  try {
    const res = await fetch(`https://api.themoviedb.org/3${endpoint}?api_key=${process.env.TMDB_API_KEY}`, {
      next: { revalidate: 3600 } 
    });
    if (!res.ok) return { results: [] };
    return res.json();
  } catch (error) {
    return { results: [] };
  }
}

async function getMovieNewsTeaser() {
  try {
    const res = await fetch(
      `https://gnews.io/api/v4/search?q=movies&lang=en&max=3&apikey=${process.env.GNEWS_API_KEY}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.articles || [];
  } catch (error) {
    return [];
  }
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  const [trendingData, topRatedData, upcomingData, nowPlayingData, popularPeopleData] = await Promise.all([
    getTMDB("/trending/movie/week"),
    getTMDB("/movie/top_rated"),
    getTMDB("/movie/upcoming"),
    getTMDB("/movie/now_playing"),
    getTMDB("/person/popular")
  ]);

  const localFavorites = await db.movie.findMany({
    take: 10,
    orderBy: { reviews: { _count: 'desc' } },
    where: { isPublished: true }
  });

  const recentNews = await getMovieNewsTeaser();

  const trending = trendingData.results?.slice(0, 12) || [];
  const topRated = topRatedData.results?.slice(0, 12) || [];
  const upcoming = upcomingData.results?.slice(0, 12) || [];
  const boxOffice = nowPlayingData.results?.slice(0, 4) || []; 
  const popularActors = popularPeopleData.results?.slice(0, 10) || [];

  return (
    <div className="pb-20">
      
      <HeroSlideshow movies={trending.slice(0, 10)} />

      <div className="max-w-7xl mx-auto px-6 mt-12 mb-20 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-black dark:text-white text-zinc-900 mb-4 tracking-tight transition-colors">Track films you’ve watched. <br className="hidden md:block"/>Save those you want to see.</h2>
        <p className="dark:text-zinc-400 text-zinc-600 text-lg max-w-2xl mx-auto transition-colors">MovieSpace is the ultimate social network for cinephiles. Discover new releases, write detailed reviews, debate in the comments, and follow your friends' cinematic journeys.</p>
      </div>

      <div className="max-w-7xl mx-auto space-y-20 relative z-10 px-6">
        
        {boxOffice.length > 0 && (
          <div className="dark:bg-zinc-900/40 bg-white border dark:border-zinc-800 border-gray-200 rounded-3xl p-6 md:p-10 shadow-sm transition-colors">
            <div className="flex items-end justify-between mb-8 pb-4 border-b dark:border-zinc-800/50 border-gray-200 transition-colors">
              <div>
                <h2 className="text-2xl md:text-3xl font-black dark:text-white text-zinc-900 flex items-center gap-3 mb-1 transition-colors">
                  <Ticket className="text-emerald-500" size={28} /> Box Office Leaderboard
                </h2>
                <p className="dark:text-zinc-400 text-zinc-600 text-sm font-medium transition-colors">Dominating theaters this weekend</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {boxOffice.map((movie: any, index: number) => {
                const estRevenue = (movie.popularity / 10).toFixed(1);
                return (
                  <Link href={`/movie/${movie.id}`} key={movie.id} className="relative group flex items-center gap-4 dark:bg-zinc-950 bg-gray-50 p-4 rounded-2xl border dark:border-zinc-800/80 border-gray-200 hover:border-red-500/50 transition-colors shadow-sm overflow-hidden">
                    <span className="absolute -right-4 -bottom-6 text-8xl font-black dark:text-zinc-800/50 text-gray-200/50 group-hover:text-red-500/10 transition-colors z-0">
                      {index + 1}
                    </span>
                    <div className="w-16 h-24 relative rounded-lg overflow-hidden shadow-md flex-shrink-0 z-10">
                      {movie.poster_path ? (
                        <Image src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} fill className="object-cover" />
                      ) : <div className="w-full h-full bg-zinc-800" />}
                    </div>
                    <div className="z-10">
                      <h3 className="font-bold text-sm dark:text-white text-zinc-900 line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">{movie.title}</h3>
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md dark:bg-emerald-500/10 bg-emerald-50 dark:text-emerald-400 text-emerald-600 text-xs font-bold border dark:border-emerald-500/20 border-emerald-200">
                        ${estRevenue}M
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {localFavorites.length > 0 && (
          <MovieRow title="Community Favorites" subtitle="Most debated and reviewed by MovieSpace users" icon={<Heart className="text-pink-500" size={28} />} movies={localFavorites} />
        )}
        
        <MovieRow title="Trending This Week" subtitle="The most popular movies across the globe right now" icon={<TrendingUp className="text-red-600" size={28} />} movies={trending} />

        <div>
          <div className="flex items-end justify-between mb-6 pb-4 border-b dark:border-zinc-800/50 border-gray-200 transition-colors">
            <div>
              <h2 className="text-2xl md:text-3xl font-black dark:text-white text-zinc-900 flex items-center gap-3 mb-1 transition-colors">
                <Compass className="text-indigo-500" size={28} /> Explore by Mood
              </h2>
              <p className="dark:text-zinc-400 text-zinc-600 text-sm font-medium transition-colors">Dive into your favorite cinematic universes</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: "Adrenaline", id: "28", img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=500&auto=format&fit=crop" },
              { title: "Nightmares", id: "27", img: "https://images.unsplash.com/photo-1505635552518-3448ff116af3?q=80&w=500&auto=format&fit=crop" },
              { title: "Laughter", id: "35", img: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?q=80&w=500&auto=format&fit=crop" },
              { title: "Other Worlds", id: "878", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=500&auto=format&fit=crop" }
            ].map((genre) => (
              <Link href={`/movies?genre=${genre.id}`} key={genre.title} className="group relative aspect-[16/10] rounded-2xl overflow-hidden shadow-md dark:border-zinc-800 border-gray-200 border">
                <Image src={genre.img} alt={genre.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 dark:opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t dark:from-zinc-950/90 from-zinc-900/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white font-black tracking-wider text-lg md:text-xl group-hover:text-red-400 transition-colors">
                   {genre.title}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <MovieRow title="Top Rated Classics" subtitle="Critically acclaimed masterpieces" icon={<Star className="text-amber-500" size={28} />} movies={topRated} />
        <MovieRow title="Upcoming Releases" subtitle="Catch them in theaters soon" icon={<Flame className="text-orange-500" size={28} />} movies={upcoming} />

        {popularActors.length > 0 && (
          <div>
            <div className="flex items-end justify-between mb-6 pb-4 border-b dark:border-zinc-800/50 border-gray-200 transition-colors">
              <div>
                <h2 className="text-2xl md:text-3xl font-black dark:text-white text-zinc-900 flex items-center gap-3 mb-1 transition-colors">
                  <Users className="text-purple-500" size={28} /> Trending Faces
                </h2>
                <p className="dark:text-zinc-400 text-zinc-600 text-sm font-medium transition-colors">The most searched cast & crew globally</p>
              </div>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-6 px-1 -mx-1 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {popularActors.map((person: any) => (
                <Link href={`/person/${person.id}`} key={person.id} className="flex flex-col items-center gap-3 snap-start min-w-[110px] group">
                  <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-[3px] dark:border-zinc-800 border-gray-200 group-hover:border-red-600 transition-colors shadow-sm">
                    {person.profile_path ? (
                      <Image src={`https://image.tmdb.org/t/p/w300${person.profile_path}`} alt={person.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full dark:bg-zinc-800 bg-gray-200 flex items-center justify-center dark:text-zinc-500 text-zinc-400 text-xs font-bold">N/A</div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm dark:text-white text-zinc-900 group-hover:text-red-600 transition-colors line-clamp-1">{person.name}</p>
                    <p className="text-[11px] dark:text-zinc-500 text-zinc-500 truncate w-24 mx-auto font-medium transition-colors">{person.known_for?.[0]?.title || "Actor"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ================= GNEWS TEASER SECTION ================= */}
        <div className="pt-16 border-t dark:border-zinc-800/50 border-gray-200 transition-colors w-full">
          <div className="flex items-center justify-between mb-8 w-full">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-red-600 rounded-sm flex-shrink-0"></div>
              <h2 className="text-2xl md:text-3xl font-black dark:text-white text-zinc-900 tracking-tight transition-colors truncate">
                Latest Updates
              </h2>
            </div>
            <Link href="/news" className="text-sm font-semibold text-red-500 hover:text-red-400 transition-colors hidden sm:block flex-shrink-0">
              View All News &rarr;
            </Link>
          </div>

          {recentNews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed dark:border-zinc-800 border-gray-300 rounded-2xl w-full">
              <Newspaper size={32} className="dark:text-zinc-700 text-zinc-300 mb-3" />
              <p className="dark:text-zinc-400 text-zinc-600 font-medium text-sm">News feed temporarily unavailable.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {recentNews.map((article: any, index: number) => (
                <a href={article.url} target="_blank" rel="noopener noreferrer" key={index} className="group flex flex-col dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all w-full">
                  <div className="relative aspect-video w-full dark:bg-zinc-800 bg-gray-200 overflow-hidden">
                    {article.image ? (
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full"><Newspaper className="dark:text-zinc-600 text-zinc-400 opacity-50" size={32} /></div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1 min-w-0 w-full">
                    <p className="text-[10px] font-bold text-red-500 uppercase mb-1">{article.source?.name}</p>
                    <h3 className="text-lg font-bold dark:text-white text-zinc-900 mb-2 group-hover:text-red-500 transition-colors break-words w-full line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="dark:text-zinc-400 text-zinc-600 text-sm mb-4 line-clamp-2 break-words w-full flex-1">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t dark:border-zinc-800/50 border-gray-100 w-full">
                      <div className="flex items-center gap-1 text-[10px] dark:text-zinc-500 text-zinc-500">
                        <Calendar size={10} />
                        {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
          <Link href="/news" className="mt-6 text-sm font-semibold text-red-500 hover:text-red-400 transition-colors block text-center sm:hidden w-full">
            View All News &rarr;
          </Link>
        </div>

      </div>
      
      {/* ================= BOTTOM CTA ================= */}
      {!session && (
        <div className="max-w-5xl mx-auto px-6 mt-32 text-center dark:bg-gradient-to-t bg-gradient-to-t dark:from-red-950/20 from-red-50 to-transparent border-t dark:border-red-900/30 border-red-200 pt-20 rounded-t-[3rem] transition-colors duration-300">
          <h2 className="text-4xl md:text-5xl font-black dark:text-white text-zinc-900 mb-6 tracking-tight transition-colors">Ready to start your diary?</h2>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all hover:scale-105 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
            Join MovieSpace Free <ChevronRight size={20} />
          </Link>
        </div>
      )}
    </div>
  );
}

// ================= HORIZONTAL SCROLLING MOVIE ROW =================
function MovieRow({ title, subtitle, icon, movies }: { title: string, subtitle?: string, icon: React.ReactNode, movies: any[] }) {
  if (!movies || movies.length === 0) return null;
  return (
    <div>
      <div className="flex items-end justify-between mb-6 pb-4 border-b dark:border-zinc-800/50 border-gray-200 transition-colors">
        <div>
          <h2 className="text-2xl md:text-3xl font-black dark:text-white text-zinc-900 flex items-center gap-3 mb-1 transition-colors">
            {icon} {title}
          </h2>
          {subtitle && <p className="dark:text-zinc-400 text-zinc-600 text-sm font-medium transition-colors">{subtitle}</p>}
        </div>
        <Link href="/movies" className="text-sm font-bold text-zinc-500 dark:hover:text-white hover:text-zinc-900 transition-colors hidden sm:flex items-center gap-1">
          See All <ChevronRight size={16} />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6 px-1 -mx-1 snap-x scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {movies.map((movie) => {
          const poster = movie.poster_path || movie.posterPath;
          const rating = movie.vote_average || movie.rating || 0;
          const year = (movie.release_date || movie.releaseDate || "").split("-")[0];

          return (
            <Link href={`/movie/${movie.id || movie.tmdbId}`} key={movie.id} className="w-[140px] md:w-[160px] flex-shrink-0 snap-start group flex flex-col gap-3">
              <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden dark:bg-zinc-900 bg-gray-200 border dark:border-zinc-800 border-gray-300 shadow-sm transition-all duration-300 group-hover:-translate-y-2 dark:group-hover:shadow-[0_15px_30px_rgba(220,38,38,0.25)] group-hover:shadow-[0_15px_30px_rgba(220,38,38,0.15)] dark:group-hover:border-zinc-600 group-hover:border-gray-400">
                {poster ? (
                  <Image src={`https://image.tmdb.org/t/p/w500${poster}`} alt={movie.title} fill sizes="(max-width: 640px) 140px, 160px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full dark:text-zinc-700 text-zinc-400 text-xs font-medium transition-colors">No Poster</div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <PlayCircle size={44} className="text-white/90 drop-shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300" />
                </div>
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/10 flex items-center gap-1 shadow-sm">
                  <Star size={10} className="text-amber-500 fill-amber-500" />
                  <span className="text-white text-[11px] font-bold">{rating.toFixed(1)}</span>
                </div>
              </div>
              <div>
                <h3 className="dark:text-white text-zinc-900 font-bold text-sm md:text-base truncate group-hover:text-red-500 transition-colors">{movie.title}</h3>
                <p className="dark:text-zinc-500 text-zinc-500 text-xs mt-0.5 font-medium transition-colors">{year || "Unknown"}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  );
}