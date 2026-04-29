import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, MessageSquare, Award, Clock, LayoutDashboard, Bookmark, Camera, PlayCircle, Settings, Users, BarChart3, Pin, X, Library, ChevronLeft, ChevronRight } from "lucide-react"; 
import AvatarUpload from "@/app/(main)/settings/AvatarUpload";
import SettingsForm from "@/app/(main)/settings/SettingsForm";
import { getCinephileBadge } from "@/lib/gamification";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ tab?: string, modal?: string, page?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) redirect("/login");

  const resolvedParams = await searchParams;
  const currentTab = resolvedParams.tab || "activity";
  const modal = resolvedParams.modal;
  const currentPage = parseInt(resolvedParams.page || "1");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      followers: { include: { follower: true } }, 
      following: { include: { following: true } }, 
      topFourMovies: true,
      favoriteMovies: { orderBy: { createdAt: "desc" } }, 
      reviews: { include: { movie: true, likes: true }, orderBy: { createdAt: "desc" } },
      collections: { include: { movies: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!user) redirect("/login");

  const totalReviews = user.reviews.length;
  const totalUpvotesReceived = user.reviews.reduce((acc, review) => acc + review.likes.length, 0);
  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "U";
  const badge = getCinephileBadge(user.level);

  const ratingDistribution = Array(10).fill(0);
  user.reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 10) ratingDistribution[r.rating - 1]++; });
  const maxRatingCount = Math.max(...ratingDistribution, 1); 

  // ================= PAGINATION MATH =================
  const REVIEWS_PER_PAGE = 5;
  const COLLECTIONS_PER_PAGE = 4;
  const WATCHLIST_PER_PAGE = 12;

  const currentReviews = user.reviews.slice((currentPage - 1) * REVIEWS_PER_PAGE, currentPage * REVIEWS_PER_PAGE);
  const totalReviewPages = Math.ceil(user.reviews.length / REVIEWS_PER_PAGE);

  const currentCollections = user.collections.slice((currentPage - 1) * COLLECTIONS_PER_PAGE, currentPage * COLLECTIONS_PER_PAGE);
  const totalCollectionPages = Math.ceil(user.collections.length / COLLECTIONS_PER_PAGE);

  const currentWatchlist = user.favoriteMovies.slice((currentPage - 1) * WATCHLIST_PER_PAGE, currentPage * WATCHLIST_PER_PAGE);
  const totalWatchlistPages = Math.ceil(user.favoriteMovies.length / WATCHLIST_PER_PAGE);

  // Reusable UI Component for the Pagination Bar
  const renderPagination = (totalPages: number) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between mt-8 border-t dark:border-zinc-800 border-gray-200 pt-6">
        {currentPage > 1 ? (
          <Link scroll={false} href={`?tab=${currentTab}&page=${currentPage - 1}`} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-gray-200 hover:border-red-500 dark:text-zinc-300 text-zinc-700 hover:text-red-600">
            <ChevronLeft size={16} /> Prev
          </Link>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold opacity-30 cursor-not-allowed dark:text-zinc-500 text-zinc-400">
            <ChevronLeft size={16} /> Prev
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold dark:text-zinc-500 text-zinc-400 uppercase tracking-wider hidden sm:block">Page</span>
          <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-600 text-white font-bold text-sm shadow-[0_0_10px_rgba(220,38,38,0.3)]">{currentPage}</span>
          <span className="text-sm font-bold dark:text-zinc-500 text-zinc-400 mx-1">of</span>
          <span className="w-8 h-8 flex items-center justify-center rounded-lg dark:bg-zinc-900 bg-gray-100 border dark:border-zinc-800 border-gray-200 dark:text-zinc-400 text-zinc-600 font-bold text-sm">{totalPages}</span>
        </div>

        {currentPage < totalPages ? (
          <Link scroll={false} href={`?tab=${currentTab}&page=${currentPage + 1}`} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-gray-200 hover:border-red-500 dark:text-zinc-300 text-zinc-700 hover:text-red-600">
            Next <ChevronRight size={16} />
          </Link>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold opacity-30 cursor-not-allowed dark:text-zinc-500 text-zinc-400">
            Next <ChevronRight size={16} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pb-20 pt-8 px-4 md:px-8 transition-colors duration-300 overflow-x-hidden relative">
      
      {/* ================= SOCIAL MODALS ================= */}
      {modal === "followers" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="dark:bg-zinc-900 bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold dark:text-white text-zinc-900">Followers ({user.followers.length})</h3>
              <Link href={`?tab=${currentTab}`} scroll={false} className="p-2 dark:bg-zinc-800 bg-gray-100 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"><X size={16}/></Link>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-4">
              {user.followers.map(f => (
                <Link href={`/user/${f.follower.id}`} key={f.follower.id} className="flex items-center gap-3 p-2 rounded-xl dark:hover:bg-zinc-800 hover:bg-gray-50 transition-colors">
                  {f.follower.image ? <img src={f.follower.image} className="w-10 h-10 rounded-full object-cover" alt=""/> : <div className="w-10 h-10 rounded-full dark:bg-zinc-800 bg-gray-200 flex items-center justify-center font-bold">{f.follower.name?.charAt(0)}</div>}
                  <div>
                    <p className="font-bold dark:text-white text-zinc-900 text-sm flex items-center gap-1">{f.follower.name} <span className="text-xs">{getCinephileBadge(f.follower.level).icon}</span></p>
                    <p className="text-xs dark:text-zinc-500 text-zinc-500">Lvl {f.follower.level}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {modal === "following" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="dark:bg-zinc-900 bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold dark:text-white text-zinc-900">Following ({user.following.length})</h3>
              <Link href={`?tab=${currentTab}`} scroll={false} className="p-2 dark:bg-zinc-800 bg-gray-100 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"><X size={16}/></Link>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-4">
              {user.following.map(f => (
                <Link href={`/user/${f.following.id}`} key={f.following.id} className="flex items-center gap-3 p-2 rounded-xl dark:hover:bg-zinc-800 hover:bg-gray-50 transition-colors">
                  {f.following.image ? <img src={f.following.image} className="w-10 h-10 rounded-full object-cover" alt=""/> : <div className="w-10 h-10 rounded-full dark:bg-zinc-800 bg-gray-200 flex items-center justify-center font-bold">{f.following.name?.charAt(0)}</div>}
                  <div>
                    <p className="font-bold dark:text-white text-zinc-900 text-sm flex items-center gap-1">{f.following.name} <span className="text-xs">{getCinephileBadge(f.following.level).icon}</span></p>
                    <p className="text-xs dark:text-zinc-500 text-zinc-500">Lvl {f.following.level}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 mt-4 md:mt-12 w-full">
        <aside className="w-full md:w-72 flex-shrink-0 space-y-6">
          <div className="dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-gray-200 shadow-sm rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden transition-colors w-full">
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl"></div>
             
             <Link href="?tab=settings" className="relative group cursor-pointer mt-2 block">
               <div className="w-28 h-28 rounded-full dark:bg-zinc-800 bg-gray-100 border-4 dark:border-zinc-950 border-white shadow-2xl overflow-hidden flex items-center justify-center relative transition-colors">
                 {user.image ? (
                   <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-4xl font-black dark:text-white text-zinc-900">{userInitial}</span>
                 )}
               </div>
               <div className="absolute -bottom-2 -right-2 bg-zinc-900 border-2 border-white rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-lg z-10" title={badge.title}>
                 {badge.icon}
               </div>
             </Link>

             <h2 className="mt-5 text-xl font-black dark:text-white text-zinc-900 tracking-tight transition-colors break-words max-w-full">
               {user.name}
             </h2>
             <div className="flex flex-col items-center gap-1 mb-4 mt-1">
               <p className={`text-sm font-bold ${badge.color} transition-colors`}>{badge.title}</p>
               <div className="flex items-center gap-2">
                 <span className="text-xs dark:text-zinc-500 text-zinc-500 font-medium">Level {user.level}</span>
                 <div className="w-16 h-1.5 dark:bg-zinc-800 bg-gray-200 rounded-full overflow-hidden">
                   <div className="h-full bg-red-600" style={{ width: `${(user.xp % 100)}%` }}></div>
                 </div>
               </div>
             </div>

             <div className="flex items-center justify-center gap-6 text-sm dark:text-zinc-400 text-zinc-500 border-t dark:border-zinc-800/50 border-gray-100 pt-4 w-full transition-colors">
               <Link href={`?tab=${currentTab}&page=${currentPage}&modal=followers`} scroll={false} className="flex flex-col items-center group cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 p-2 rounded-xl transition-colors">
                 <span className="font-black dark:text-white text-zinc-900 text-lg group-hover:text-red-500 transition-colors">{user.followers.length}</span>
                 <span className="text-[10px] uppercase tracking-wider font-semibold">Followers</span>
               </Link>
               <div className="w-px h-8 dark:bg-zinc-800 bg-gray-200 transition-colors"></div>
               <Link href={`?tab=${currentTab}&page=${currentPage}&modal=following`} scroll={false} className="flex flex-col items-center group cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 p-2 rounded-xl transition-colors">
                 <span className="font-black dark:text-white text-zinc-900 text-lg group-hover:text-red-500 transition-colors">{user.following.length}</span>
                 <span className="text-[10px] uppercase tracking-wider font-semibold">Following</span>
               </Link>
             </div>
          </div>

          <nav className="flex flex-col gap-2 w-full">
            <Link href="?tab=activity&page=1" scroll={false} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-colors ${currentTab === "activity" ? "dark:bg-red-600/10 bg-red-50 dark:text-red-500 text-red-600 border dark:border-red-500/20 border-red-200 shadow-sm" : "dark:text-zinc-400 text-zinc-500 dark:hover:bg-zinc-900/80 hover:bg-gray-100 dark:hover:text-white hover:text-zinc-900"}`}>
              <LayoutDashboard size={18} /> Activity Overview
            </Link>
            
            <Link href="?tab=collections&page=1" scroll={false} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-colors ${currentTab === "collections" ? "dark:bg-purple-500/10 bg-purple-50 dark:text-purple-500 text-purple-600 border dark:border-purple-500/20 border-purple-200 shadow-sm" : "dark:text-zinc-400 text-zinc-500 dark:hover:bg-zinc-900/80 hover:bg-gray-100 dark:hover:text-white hover:text-zinc-900"}`}>
              <Library size={18} /> Custom Lists
              <span className="ml-auto text-xs dark:bg-zinc-800 bg-gray-200 dark:text-zinc-300 text-zinc-700 py-0.5 px-2 rounded-full transition-colors">{user.collections.length}</span>
            </Link>

            <Link href="?tab=watchlist&page=1" scroll={false} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-colors ${currentTab === "watchlist" ? "dark:bg-amber-500/10 bg-amber-50 dark:text-amber-500 text-amber-600 border dark:border-amber-500/20 border-amber-200 shadow-sm" : "dark:text-zinc-400 text-zinc-500 dark:hover:bg-zinc-900/80 hover:bg-gray-100 dark:hover:text-white hover:text-zinc-900"}`}>
              <Bookmark size={18} /> Watchlist 
              <span className="ml-auto text-xs dark:bg-zinc-800 bg-gray-200 dark:text-zinc-300 text-zinc-700 py-0.5 px-2 rounded-full transition-colors">{user.favoriteMovies.length}</span>
            </Link>
            
            <Link href="?tab=settings" scroll={false} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-colors mt-4 border-t dark:border-zinc-800/50 border-gray-200 pt-4 ${currentTab === "settings" ? "dark:bg-zinc-800 bg-gray-200 dark:text-white text-zinc-900 shadow-sm" : "dark:text-zinc-400 text-zinc-500 dark:hover:bg-zinc-900/80 hover:bg-gray-100 dark:hover:text-white hover:text-zinc-900"}`}>
              <Settings size={18} /> Account Settings
            </Link>
          </nav>
        </aside>

        <main className="flex-1 space-y-8 w-full max-w-full overflow-hidden">
          
          {currentTab === "activity" && (
            <div className="animate-in fade-in duration-500 w-full">
              {currentPage === 1 && (
                <div className="mb-12 w-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-pink-500 rounded-sm"></div>
                      <h2 className="text-2xl font-bold dark:text-white text-zinc-900 tracking-tight flex items-center gap-2 transition-colors">Top 4 Favorites</h2>
                    </div>
                    <Pin className="text-pink-500/50" size={24} />
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 w-full">
                    {[0, 1, 2, 3].map((index) => {
                      const movie = user.topFourMovies[index];
                      return (
                        <div key={index} className="relative aspect-[2/3] w-full rounded-xl overflow-hidden dark:bg-zinc-900/50 bg-gray-100 border dark:border-zinc-800 border-gray-200 shadow-sm group transition-colors">
                          {movie ? (
                            <Link href={`/movie/${movie.id}`} className="block w-full h-full">
                              {movie.posterPath ? (
                                <Image src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} alt={movie.title} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : <div className="flex items-center justify-center w-full h-full dark:text-zinc-700 text-zinc-400 text-xs font-medium transition-colors">No Poster</div>}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                <span className="text-white font-bold text-sm truncate drop-shadow-md w-full">{movie.title}</span>
                              </div>
                            </Link>
                          ) : (
                            <Link href="/movies" className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed dark:border-zinc-800 border-gray-300 hover:border-pink-500/50 hover:bg-pink-50 dark:hover:bg-pink-500/5 transition-all dark:text-zinc-600 text-zinc-400 hover:text-pink-500 cursor-pointer">
                              <span className="text-3xl font-light mb-2">+</span>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-center px-4 w-full break-words">Pick a<br/>Favorite</span>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentPage === 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 w-full">
                  <div className="flex flex-col justify-center dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-gray-200 p-5 rounded-2xl shadow-sm transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="text-red-500" size={18} />
                      <p className="text-xs dark:text-zinc-500 text-zinc-500 font-bold uppercase tracking-wider transition-colors truncate">Reviews</p>
                    </div>
                    <p className="text-3xl dark:text-white text-zinc-900 font-black transition-colors">{totalReviews}</p>
                  </div>
                  <div className="flex flex-col justify-center dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-gray-200 p-5 rounded-2xl shadow-sm transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="text-amber-500" size={18} />
                      <p className="text-xs dark:text-zinc-500 text-zinc-500 font-bold uppercase tracking-wider transition-colors truncate">Upvotes</p>
                    </div>
                    <p className="text-3xl dark:text-white text-zinc-900 font-black transition-colors">{totalUpvotesReceived}</p>
                  </div>
                  <div className="flex flex-col justify-center dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-gray-200 p-5 rounded-2xl col-span-2 sm:col-span-1 shadow-sm transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="text-indigo-500" size={18} />
                      <p className="text-xs dark:text-zinc-500 text-zinc-500 font-bold uppercase tracking-wider transition-colors truncate">Joined</p>
                    </div>
                    <p className="text-lg dark:text-white text-zinc-900 font-bold mt-1 transition-colors">{new Date(user.createdAt).getFullYear()}</p>
                  </div>
                </div>
              )}

              {currentPage === 1 && totalReviews > 0 && (
                <div className="dark:bg-zinc-900/30 bg-white border dark:border-zinc-800/50 border-gray-200 rounded-2xl p-6 md:p-8 mb-8 shadow-sm transition-colors w-full overflow-hidden">
                  <div className="flex items-center gap-3 mb-8">
                    <BarChart3 className="text-amber-500 flex-shrink-0" size={24} />
                    <h2 className="text-xl font-bold dark:text-white text-zinc-900 tracking-tight transition-colors truncate">Rating Distribution</h2>
                  </div>
                  <div className="flex items-end justify-between h-40 gap-1 sm:gap-2 w-full">
                    {ratingDistribution.map((count, index) => {
                      const heightPercentage = (count / maxRatingCount) * 100;
                      return (
                        <div key={index} className="flex flex-col items-center flex-1 gap-2 group">
                          <span className="text-[10px] dark:text-zinc-500 text-zinc-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{count}</span>
                          <div className="w-full dark:bg-zinc-800 bg-gray-100 rounded-t-sm relative overflow-hidden dark:group-hover:bg-zinc-700 group-hover:bg-gray-200 transition-colors" style={{ height: '100px' }}>
                            <div className="absolute bottom-0 w-full bg-amber-500 transition-all duration-1000 ease-out" style={{ height: `${heightPercentage}%` }}></div>
                          </div>
                          <span className="text-xs font-bold dark:text-zinc-400 text-zinc-500 dark:group-hover:text-white group-hover:text-zinc-900 transition-colors">{index + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="dark:bg-zinc-900/30 bg-white border dark:border-zinc-800/50 border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm transition-colors w-full overflow-hidden">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-6 bg-red-600 rounded-sm flex-shrink-0"></div>
                  <h2 className="text-2xl font-bold dark:text-white text-zinc-900 tracking-tight transition-colors truncate">Review Diary</h2>
                </div>

                <div className="space-y-4 w-full">
                  {currentReviews.length === 0 ? (
                    <div className="text-center py-12 border border-dashed dark:border-zinc-800 border-gray-300 rounded-xl transition-colors w-full">
                      <p className="dark:text-zinc-500 text-zinc-500 mb-2 transition-colors">Your diary is empty here.</p>
                      {currentPage === 1 && <Link href="/movies" className="text-red-500 hover:text-red-400 font-semibold transition-colors">Go watch some movies &rarr;</Link>}
                    </div>
                  ) : (
                    currentReviews.map((review) => (
                      <div key={review.id} className="dark:bg-zinc-950 bg-gray-50 border dark:border-zinc-800 border-gray-200 rounded-xl p-4 md:p-5 flex flex-col sm:flex-row gap-5 dark:hover:border-zinc-700 hover:border-gray-300 transition-colors w-full max-w-full overflow-hidden">
                        <Link href={`/movie/${review.movie.id}`} className="w-20 sm:w-24 flex-shrink-0 relative aspect-[2/3] rounded-lg overflow-hidden border dark:border-zinc-800 border-gray-300 hidden sm:block transition-colors">
                          {review.movie.posterPath && <Image src={`https://image.tmdb.org/t/p/w200${review.movie.posterPath}`} alt={review.movie.title} fill sizes="100px" className="object-cover hover:scale-105 transition-transform" />}
                        </Link>
                        <div className="flex-1 flex flex-col min-w-0 w-full">
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <div className="min-w-0 flex-1">
                              <Link href={`/movie/${review.movie.id}`} className="text-lg font-bold dark:text-white text-zinc-900 hover:text-red-500 transition-colors block truncate w-full">{review.movie.title}</Link>
                              <div className="flex items-center gap-2 mt-1 text-xs dark:text-zinc-500 text-zinc-500 transition-colors">
                                <Clock size={12} className="flex-shrink-0" />
                                <span className="truncate">{new Date(review.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-md flex-shrink-0">
                              <Star size={12} className="text-amber-500 fill-amber-500" />
                              <span className="text-amber-500 font-bold text-xs">{review.rating}</span>
                            </div>
                          </div>
                          <p className="dark:text-zinc-400 text-zinc-600 text-sm leading-relaxed mt-2 flex-1 whitespace-pre-wrap break-words overflow-hidden w-full max-w-full line-clamp-3 transition-colors">
                            {review.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {renderPagination(totalReviewPages)}
              </div>
            </div>
          )}

          {/* ================= COLLECTIONS TAB ================= */}
          {currentTab === "collections" && (
            <div className="dark:bg-zinc-900/30 bg-white border dark:border-zinc-800/50 border-gray-200 rounded-2xl p-6 md:p-8 animate-in fade-in duration-500 shadow-sm transition-colors w-full overflow-hidden">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-purple-500 rounded-sm flex-shrink-0"></div>
                <h2 className="text-2xl font-bold dark:text-white text-zinc-900 tracking-tight transition-colors truncate">My Collections</h2>
              </div>
              
              {currentCollections.length === 0 ? (
                <div className="text-center py-20 border border-dashed dark:border-zinc-800 border-gray-300 rounded-xl transition-colors w-full">
                  <Library size={48} className="mx-auto dark:text-zinc-700 text-zinc-300 mb-4 transition-colors" />
                  <p className="dark:text-zinc-500 text-zinc-500 text-lg mb-2 transition-colors">You haven't created any custom lists yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {currentCollections.map((collection) => (
                    <div key={collection.id} className="dark:bg-zinc-950 bg-gray-50 border dark:border-zinc-800 border-gray-200 rounded-xl p-5 shadow-sm transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg dark:text-white text-zinc-900 truncate">{collection.name}</h3>
                          <p className="text-xs font-semibold dark:text-zinc-500 text-zinc-500 uppercase tracking-wider">{collection.movies.length} Movies</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[0, 1, 2, 3].map(i => {
                          const movie = collection.movies[i];
                          return movie ? (
                            <Link href={`/movie/${movie.id}`} key={i} className="aspect-[2/3] relative rounded-md overflow-hidden bg-zinc-800 border dark:border-zinc-800 border-gray-300 hover:border-purple-500 transition-all">
                              {movie.posterPath && <Image src={`https://image.tmdb.org/t/p/w200${movie.posterPath}`} alt={movie.title} fill className="object-cover" />}
                            </Link>
                          ) : (
                            <div key={i} className="aspect-[2/3] rounded-md dark:bg-zinc-900/50 bg-gray-200 border border-dashed dark:border-zinc-800/50 border-gray-300 transition-colors"></div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {renderPagination(totalCollectionPages)}
            </div>
          )}

          {/* ================= WATCHLIST TAB ================= */}
          {currentTab === "watchlist" && (
            <div className="dark:bg-zinc-900/30 bg-white border dark:border-zinc-800/50 border-gray-200 rounded-2xl p-6 md:p-8 animate-in fade-in duration-500 shadow-sm transition-colors w-full overflow-hidden">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-amber-500 rounded-sm flex-shrink-0"></div>
                <h2 className="text-2xl font-bold dark:text-white text-zinc-900 tracking-tight transition-colors truncate">Your Watchlist</h2>
              </div>
              {currentWatchlist.length === 0 ? (
                <div className="text-center py-20 border border-dashed dark:border-zinc-800 border-gray-300 rounded-xl transition-colors w-full">
                  <Bookmark size={48} className="mx-auto dark:text-zinc-700 text-zinc-300 mb-4 transition-colors" />
                  <p className="dark:text-zinc-500 text-zinc-500 text-lg mb-2 transition-colors">You haven't saved any movies yet.</p>
                  {currentPage === 1 && <Link href="/movies" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">Browse the catalog &rarr;</Link>}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full">
                  {currentWatchlist.map((movie) => (
                    <Link href={`/movie/${movie.id}`} key={movie.id} className="group flex flex-col gap-2 w-full overflow-hidden">
                      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden dark:bg-zinc-900 bg-gray-200 border dark:border-zinc-800 border-gray-300 shadow-lg group-hover:border-amber-500/50 transition-all">
                        {movie.posterPath ? <Image src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} alt={movie.title} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="flex items-center justify-center w-full h-full dark:text-zinc-700 text-zinc-400 transition-colors">N/A</div>}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <PlayCircle size={40} className="text-white/90 drop-shadow-lg scale-90 group-hover:scale-100 transition-transform" />
                        </div>
                      </div>
                      <h3 className="dark:text-white text-zinc-900 font-bold text-sm truncate group-hover:text-amber-500 transition-colors w-full">{movie.title}</h3>
                    </Link>
                  ))}
                </div>
              )}
              {renderPagination(totalWatchlistPages)}
            </div>
          )}

          {currentTab === "settings" && (
            <div className="dark:bg-zinc-900/30 bg-white border dark:border-zinc-800/50 border-gray-200 rounded-2xl p-6 md:p-8 animate-in fade-in duration-500 shadow-sm transition-colors w-full overflow-hidden">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-zinc-500 rounded-sm flex-shrink-0"></div>
                <h2 className="text-2xl font-bold dark:text-white text-zinc-900 tracking-tight transition-colors truncate">Account Settings</h2>
              </div>
              <div className="mb-8 pb-8 border-b dark:border-zinc-800/50 border-gray-200 transition-colors w-full overflow-hidden">
                <AvatarUpload currentImage={user.image} />
              </div>
              <div className="w-full max-w-full overflow-hidden">
                <SettingsForm initialName={user.name || ""} initialBio={user.bio || ""} />
              </div>
          </div>)}

        </main>
      </div>
    </div>
  );
}