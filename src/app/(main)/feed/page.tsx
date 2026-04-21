import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Clock, Star, MessageSquare, Users, Film, Heart } from "lucide-react";

export const dynamic = "force-dynamic";

// Fetch 10 trending movies to build the mosaic background
async function getTrendingMovies() {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.TMDB_API_KEY}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results.slice(0, 10) || []; 
  } catch (error) {
    return [];
  }
}

export default async function FeedPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { following: { select: { followingId: true } } }
  });

  if (!currentUser) redirect("/login");

  const followingIds = currentUser.following.map(f => f.followingId);

  // Run fetches in parallel
  const [feedReviews, trendingMovies] = await Promise.all([
    db.review.findMany({
      where: { userId: { in: followingIds } },
      include: { user: true, movie: true, likes: true, comments: true },
      orderBy: { createdAt: "desc" },
      take: 50 
    }),
    getTrendingMovies()
  ]);

  return (
    <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pb-20 transition-colors duration-300">
      
      {/* ================= MOSAIC HERO SECTION (Matching Movies Page) ================= */}
      <div className="relative w-full h-[50vh] flex items-center justify-center border-b dark:border-zinc-800/50 border-gray-200 mb-12 overflow-hidden dark:bg-zinc-900 bg-gray-200 transition-colors duration-300">
        <div className="absolute inset-0 z-0 flex flex-wrap opacity-40">
          {trendingMovies.map((m: any) => (
            <div key={m.id} className="w-1/5 h-1/2 relative">
               {m.backdrop_path && <Image src={`https://image.tmdb.org/t/p/w500${m.backdrop_path}`} fill sizes="20vw" className="object-cover" alt="" />}
            </div>
          ))}
        </div>
        <div className="absolute inset-0 dark:bg-gradient-to-t dark:from-zinc-950 dark:via-zinc-950/60 dark:to-zinc-950/30 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent z-10"></div>
        
        <div className="relative z-20 text-center px-6 max-w-3xl">
          <Users className="text-red-600 mx-auto mb-6" size={56} />
          <h1 className="text-5xl md:text-7xl font-black dark:text-white text-zinc-900 tracking-tight mb-6 drop-shadow-2xl transition-colors">
            Your Social Feed
          </h1>
          <p className="text-lg md:text-xl dark:text-white/90 text-zinc-700 font-medium drop-shadow-md transition-colors">
            See what the cinephiles you follow are watching and reviewing.
          </p>
        </div>
      </div>

      {/* ================= SOCIAL FEED CONTENT ================= */}
      <div className="max-w-2xl mx-auto px-4 md:px-8">
        {followingIds.length === 0 ? (
          <div className="dark:bg-zinc-900/30 bg-white border dark:border-zinc-800 border-gray-200 rounded-3xl p-10 md:p-16 text-center shadow-sm transition-colors">
            <div className="w-20 h-20 mx-auto dark:bg-zinc-800 bg-gray-100 rounded-full flex items-center justify-center mb-6 transition-colors">
              <Users size={36} className="dark:text-zinc-500 text-zinc-400" />
            </div>
            <h2 className="text-2xl font-bold dark:text-white text-zinc-900 mb-3 transition-colors">Your feed is quiet</h2>
            <p className="dark:text-zinc-400 text-zinc-600 mb-8 max-w-sm mx-auto transition-colors">Follow other cinephiles to see their latest reviews, ratings, and cinematic discoveries here.</p>
            <Link href="/movies" className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:-translate-y-1">
              Explore Movies & Find Users
            </Link>
          </div>
        ) : feedReviews.length === 0 ? (
          <div className="dark:bg-zinc-900/30 bg-white border dark:border-zinc-800 border-gray-200 rounded-3xl p-10 md:p-16 text-center shadow-sm transition-colors">
            <div className="w-20 h-20 mx-auto dark:bg-zinc-800 bg-gray-100 rounded-full flex items-center justify-center mb-6 transition-colors">
              <MessageSquare size={36} className="dark:text-zinc-500 text-zinc-400" />
            </div>
            <h2 className="text-2xl font-bold dark:text-white text-zinc-900 mb-3 transition-colors">No recent activity</h2>
            <p className="dark:text-zinc-400 text-zinc-600 transition-colors">The people you follow haven't posted any reviews recently. Check back later!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {feedReviews.map((review) => {
              const userInitial = review.user.name ? review.user.name.charAt(0).toUpperCase() : "U";
              
              return (
                <div key={review.id} className="dark:bg-zinc-900/40 bg-white border dark:border-zinc-800/80 border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                  
                  <div className="flex items-center justify-between p-4 md:p-5">
                    <Link href={`/user/${review.user.id}`} className="flex items-center gap-3 group">
                      {review.user.image ? (
                        <img src={review.user.image} alt={review.user.name || "User"} className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border-2 border-transparent group-hover:border-red-500 transition-colors" />
                      ) : (
                        <div className="w-10 h-10 md:w-11 md:h-11 rounded-full dark:bg-zinc-800 bg-gray-100 flex items-center justify-center text-sm font-bold dark:text-white text-zinc-900 border-2 border-transparent group-hover:border-red-500 transition-colors">
                          {userInitial}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-sm md:text-base dark:text-white text-zinc-900 group-hover:text-red-600 transition-colors">{review.user.name}</p>
                        <div className="flex items-center gap-1.5 text-[11px] md:text-xs dark:text-zinc-500 text-zinc-500">
                          <Clock size={12} />
                          {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </Link>

                    <div className="flex flex-col items-center justify-center bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                      <Star size={14} className="text-amber-500 fill-amber-500 mb-0.5" />
                      <span className="text-amber-600 dark:text-amber-500 font-black text-xs md:text-sm leading-none">{review.rating}<span className="text-[10px] opacity-60">/10</span></span>
                    </div>
                  </div>

                  <Link href={`/movie/${review.movie.id}`} className="block relative w-full h-40 md:h-56 dark:bg-zinc-950 bg-gray-200 overflow-hidden group">
                    {review.movie.backdropPath ? (
                      <Image 
                        src={`https://image.tmdb.org/t/p/w1280${review.movie.backdropPath}`} 
                        alt="Backdrop" 
                        fill 
                        priority 
                        sizes="(max-width: 768px) 100vw, 800px"
                        className="object-cover object-center md:object-top opacity-60 dark:opacity-40 group-hover:scale-105 group-hover:opacity-80 dark:group-hover:opacity-60 transition-all duration-700" 
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center dark:text-zinc-800 text-gray-300">
                        <Film size={48} />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 w-full p-4 flex items-end gap-4">
                      <div className="relative w-16 md:w-20 aspect-[2/3] rounded-md overflow-hidden border border-white/20 shadow-lg flex-shrink-0 bg-zinc-900">
                        {review.movie.posterPath && (
                          <Image 
                            src={`https://image.tmdb.org/t/p/w342${review.movie.posterPath}`} 
                            alt="Poster" 
                            fill 
                            sizes="(max-width: 768px) 64px, 80px"
                            className="object-cover" 
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-1">
                        <h3 className="text-white font-black text-lg md:text-xl line-clamp-1 drop-shadow-md group-hover:text-red-400 transition-colors">{review.movie.title}</h3>
                        <p className="text-white/70 text-xs md:text-sm font-medium drop-shadow-md">{review.movie.releaseDate?.split('-')[0] || 'Unknown Year'}</p>
                      </div>
                    </div>
                  </Link>

                  <div className="p-4 md:p-5">
                    <p className="dark:text-zinc-300 text-zinc-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap transition-colors">
                      {review.content}
                    </p>
                    
                    <div className="flex items-center justify-between mt-5 pt-4 border-t dark:border-zinc-800/50 border-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <Link href={`/movie/${review.movie.id}#reviews`} className="flex items-center gap-1.5 text-xs md:text-sm font-bold dark:text-zinc-400 text-zinc-500 hover:text-red-600 transition-colors bg-gray-50 dark:bg-zinc-900 px-3 py-1.5 rounded-md">
                          <MessageSquare size={16} /> {review.comments.length}
                        </Link>
                        <Link href={`/movie/${review.movie.id}#reviews`} className="flex items-center gap-1.5 text-xs md:text-sm font-bold dark:text-zinc-400 text-zinc-500 hover:text-red-600 transition-colors bg-gray-50 dark:bg-zinc-900 px-3 py-1.5 rounded-md">
                          <Heart size={16} /> {review.likes.length}
                        </Link>
                      </div>
                      
                      <Link href={`/movie/${review.movie.id}`} className="text-xs md:text-sm font-bold text-red-600 hover:text-red-700 transition-colors">
                        Read More &rarr;
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}