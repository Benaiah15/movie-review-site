import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Clock, Star, MessageSquare, Users, Film, Heart, Activity, Sparkles, Flame, ChevronLeft, ChevronRight } from "lucide-react";

export const revalidate = 60;
export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 10; // Change this number to show more/less items per page

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

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ filter?: string, page?: string }> }) {
  const resolvedParams = await searchParams;
  const currentFilter = resolvedParams.filter || "all";
  const currentPage = parseInt(resolvedParams.page || "1");
  
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { 
      following: { select: { followingId: true } },
      followers: { select: { followerId: true } }
    }
  });

  if (!currentUser) redirect("/login");

  const followingIds = currentUser.following.map(f => f.followingId);
  const followerIds = currentUser.followers.map(f => f.followerId);
  const networkIds = Array.from(new Set([...followingIds, ...followerIds]));

  let whereClause: any = { userId: { in: networkIds } };
  
  if (currentFilter === "top-rated") {
    whereClause.rating = { gte: 4.5 };
  } else if (currentFilter === "discussions") {
    whereClause.comments = { some: {} }; 
  }

  // Fetch the total count for pagination math AND the items for this specific page
  const [totalReviews, feedReviews, trendingMovies] = await Promise.all([
    db.review.count({ where: whereClause }),
    db.review.findMany({
      where: whereClause,
      include: { user: true, movie: true, likes: true, comments: true },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE 
    }),
    getTrendingMovies()
  ]);

  const totalPages = Math.ceil(totalReviews / ITEMS_PER_PAGE);

  const tabs = [
    { id: "all", name: "All Activity", icon: Activity },
    { id: "top-rated", name: "Masterpieces", icon: Sparkles },
    { id: "discussions", name: "Hot Discussions", icon: Flame },
  ];

  return (
    <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pb-20 transition-colors duration-300">
      
      {/* ================= MOSAIC HERO SECTION ================= */}
      <div className="relative w-full h-[50vh] flex items-center justify-center border-b dark:border-zinc-800/50 border-gray-200 mb-8 md:mb-12 overflow-hidden dark:bg-zinc-900 bg-gray-200 transition-colors duration-300">
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
            Network Feed
          </h1>
          <p className="text-lg md:text-xl dark:text-white/90 text-zinc-700 font-medium drop-shadow-md transition-colors">
            See what the cinephiles in your network are watching and reviewing.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* ================= FILTER SIDEBAR ================= */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <div className="dark:bg-zinc-900/50 bg-white border dark:border-zinc-800/80 border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
              <p className="text-xs font-bold dark:text-zinc-500 text-zinc-400 uppercase tracking-wider px-3 mb-2">Filter Feed</p>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentFilter === tab.id;
                return (
                  <Link 
                    key={tab.id} 
                    href={`/feed?filter=${tab.id}&page=1`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive 
                        ? "bg-red-500/10 text-red-600 dark:text-red-400" 
                        : "dark:text-zinc-400 text-zinc-600 dark:hover:bg-zinc-800/50 hover:bg-gray-50 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-red-500" : "opacity-70"} />
                    {tab.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= MAIN FEED COLUMN ================= */}
        <div className="col-span-1 lg:col-span-3">
          
          <div className="lg:hidden flex overflow-x-auto gap-2 pb-4 mb-4 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentFilter === tab.id;
              return (
                <Link key={tab.id} href={`/feed?filter=${tab.id}&page=1`} className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold snap-start transition-all border ${isActive ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400" : "dark:bg-zinc-900 bg-white dark:border-zinc-800 border-gray-200 dark:text-zinc-400 text-zinc-600"}`}>
                  <Icon size={14} className={isActive ? "text-red-500" : "opacity-70"} />
                  {tab.name}
                </Link>
              );
            })}
          </div>

          {networkIds.length === 0 || feedReviews.length === 0 ? (
            <div className="dark:bg-zinc-900/30 bg-white border dark:border-zinc-800 border-gray-200 rounded-3xl p-10 md:p-16 text-center shadow-sm transition-colors mt-4">
              <div className="w-20 h-20 mx-auto dark:bg-zinc-800 bg-gray-100 rounded-full flex items-center justify-center mb-6 transition-colors">
                <MessageSquare size={36} className="dark:text-zinc-500 text-zinc-400" />
              </div>
              <h2 className="text-2xl font-bold dark:text-white text-zinc-900 mb-3 transition-colors">No activity found</h2>
              <Link href="/movies" className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all mt-4">Explore Movies</Link>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8">
              {feedReviews.map((review) => {
                const userInitial = review.user.name ? review.user.name.charAt(0).toUpperCase() : "U";
                return (
                  <div key={review.id} className="dark:bg-zinc-900/60 bg-white border dark:border-zinc-800/80 border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between p-4 md:p-5">
                      <Link href={`/user/${review.user.id}`} className="flex items-center gap-3 group">
                        {review.user.image ? (
                          <img src={review.user.image} alt="User" className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border-2 border-transparent group-hover:border-red-500 transition-colors" />
                        ) : (
                          <div className="w-10 h-10 md:w-11 md:h-11 rounded-full dark:bg-zinc-800 bg-gray-100 flex items-center justify-center text-sm font-bold dark:text-white text-zinc-900 border-2 border-transparent group-hover:border-red-500">{userInitial}</div>
                        )}
                        <div>
                          <p className="font-bold text-sm md:text-base dark:text-white text-zinc-900 group-hover:text-red-600">{review.user.name}</p>
                          <div className="flex items-center gap-1.5 text-[11px] md:text-xs dark:text-zinc-500 text-zinc-500"><Clock size={12} /> {new Date(review.createdAt).toLocaleDateString()}</div>
                        </div>
                      </Link>
                      <div className="flex flex-col items-center justify-center bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                        <Star size={14} className="text-amber-500 fill-amber-500 mb-0.5" />
                        <span className="text-amber-600 dark:text-amber-500 font-black text-xs md:text-sm leading-none">{review.rating}<span className="text-[10px] opacity-60">/10</span></span>
                      </div>
                    </div>
                    <Link href={`/movie/${review.movie.id}`} className="block relative w-full h-40 md:h-64 dark:bg-zinc-950 bg-gray-200 overflow-hidden group">
                      {review.movie.backdropPath ? <Image src={`https://image.tmdb.org/t/p/w1280${review.movie.backdropPath}`} alt="Backdrop" fill className="object-cover opacity-60 dark:opacity-40 group-hover:scale-105 transition-all duration-700" /> : <div className="absolute inset-0 flex items-center justify-center dark:text-zinc-800 text-gray-300"><Film size={48} /></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 flex items-end gap-4 md:gap-6">
                        <div className="relative w-16 md:w-24 aspect-[2/3] rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl flex-shrink-0 bg-zinc-900 group-hover:-translate-y-2 transition-transform duration-500">
                          {review.movie.posterPath && <Image src={`https://image.tmdb.org/t/p/w342${review.movie.posterPath}`} alt="Poster" fill className="object-cover" />}
                        </div>
                        <div className="flex-1 pb-1 md:pb-2">
                          <h3 className="text-white font-black text-xl md:text-3xl line-clamp-1 drop-shadow-md group-hover:text-red-400">{review.movie.title}</h3>
                        </div>
                      </div>
                    </Link>
                    <div className="p-4 md:p-6">
                      <p className="dark:text-zinc-300 text-zinc-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap">{review.content}</p>
                    </div>
                  </div>
                );
              })}

              {/* STYLISH PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                  {currentPage > 1 ? (
                    <Link href={`/feed?filter=${currentFilter}&page=${currentPage - 1}`} className="p-2 rounded-xl dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-gray-200 hover:border-red-500 dark:hover:border-red-500 transition-colors group">
                      <ChevronLeft size={20} className="dark:text-zinc-400 text-zinc-600 group-hover:text-red-500" />
                    </Link>
                  ) : <div className="p-2 rounded-xl opacity-30 cursor-not-allowed"><ChevronLeft size={20} /></div>}

                  <div className="flex items-center gap-2 mx-4">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      // Show limited page numbers to avoid squeezing on mobile
                      if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                        return (
                          <Link key={pageNum} href={`/feed?filter=${currentFilter}&page=${pageNum}`} className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${currentPage === pageNum ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]" : "dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-gray-200 dark:text-zinc-400 text-zinc-600 hover:border-red-500 dark:hover:border-red-500"}`}>
                            {pageNum}
                          </Link>
                        );
                      } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                        return <span key={pageNum} className="text-zinc-500">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  {currentPage < totalPages ? (
                    <Link href={`/feed?filter=${currentFilter}&page=${currentPage + 1}`} className="p-2 rounded-xl dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-gray-200 hover:border-red-500 dark:hover:border-red-500 transition-colors group">
                      <ChevronRight size={20} className="dark:text-zinc-400 text-zinc-600 group-hover:text-red-500" />
                    </Link>
                  ) : <div className="p-2 rounded-xl opacity-30 cursor-not-allowed"><ChevronRight size={20} /></div>}
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}