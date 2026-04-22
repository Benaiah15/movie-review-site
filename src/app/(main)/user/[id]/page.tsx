import db from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, MessageSquare, Award, Clock, Bookmark, PlayCircle, BarChart3, Pin, UserPlus, UserCheck } from "lucide-react"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import FollowButton from "@/components/FollowButton"; // <-- IMPORTED THE REAL COMPONENT

export const revalidate = 60; // Updates the cache every 60 seconds
export const dynamic = "force-dynamic";

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  // If the user clicks their own profile, redirect to their private dashboard
  if (session?.user?.id === resolvedParams.id) {
    redirect("/profile");
  }

  const user = await db.user.findUnique({
    where: { id: resolvedParams.id },
    include: {
      followers: true, 
      following: true, 
      topFourMovies: true, 
      favoriteMovies: { orderBy: { createdAt: "desc" } }, 
      reviews: {
        include: { movie: true, likes: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) notFound();

  const totalReviews = user.reviews.length;
  const totalUpvotesReceived = user.reviews.reduce((acc, review) => acc + review.likes.length, 0);
  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "U";
  
  // FIXED: Check if the current user's ID exists in the target user's `followers` array 
  // by mapping through the `followerId` field which Prisma uses for many-to-many joins.
  const isFollowing = session?.user?.id 
    ? user.followers.some(f => f.followerId === session.user.id) 
    : false;

  const ratingDistribution = Array(10).fill(0);
  user.reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 10) ratingDistribution[r.rating - 1]++;
  });
  const maxRatingCount = Math.max(...ratingDistribution, 1); 

  return (
    <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pb-20 pt-24 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-full md:w-72 flex-shrink-0 space-y-6">
          <div className="dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden shadow-sm transition-colors">
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl"></div>
             
             <div className="w-28 h-28 rounded-full dark:bg-zinc-800 bg-gray-100 border-4 dark:border-zinc-950 border-white shadow-xl overflow-hidden flex items-center justify-center relative mt-2 transition-colors">
               {user.image ? (
                 <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
               ) : (
                 <span className="text-4xl font-black dark:text-white text-zinc-900 transition-colors">{userInitial}</span>
               )}
             </div>

             <h2 className="mt-5 text-xl font-black dark:text-white text-zinc-900 tracking-tight transition-colors">{user.name}</h2>
             <p className="text-sm dark:text-zinc-500 text-zinc-500 font-medium mb-4 transition-colors">Lvl {user.rank} Cinephile</p>
             {user.bio && <p className="text-sm dark:text-zinc-300 text-zinc-600 italic mb-4 transition-colors">"{user.bio}"</p>}

             {/* FIXED: The real interactive component is injected here */}
             <div className="w-full flex justify-center mb-4">
                <FollowButton targetUserId={user.id} initialIsFollowing={isFollowing} />
             </div>

             <div className="flex items-center justify-center gap-6 text-sm dark:text-zinc-400 text-zinc-500 border-t dark:border-zinc-800/50 border-gray-100 pt-4 w-full transition-colors">
               <div className="flex flex-col items-center">
                 <span className="font-black dark:text-white text-zinc-900 text-lg transition-colors">{user.followers.length}</span>
                 <span className="text-[10px] uppercase tracking-wider font-semibold">Followers</span>
               </div>
               <div className="w-px h-8 dark:bg-zinc-800 bg-gray-200 transition-colors"></div>
               <div className="flex flex-col items-center">
                 <span className="font-black dark:text-white text-zinc-900 text-lg transition-colors">{user.following.length}</span>
                 <span className="text-[10px] uppercase tracking-wider font-semibold">Following</span>
               </div>
             </div>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT */}
        <main className="flex-1 space-y-8">
          
          {/* TOP 4 MOVIES */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-pink-500 rounded-sm"></div>
                <h2 className="text-2xl font-bold dark:text-white text-zinc-900 tracking-tight flex items-center gap-2 transition-colors">
                  {user.name?.split(" ")[0]}'s Top 4
                </h2>
              </div>
              <Pin className="text-pink-500/50" size={24} />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
              {[0, 1, 2, 3].map((index) => {
                const movie = user.topFourMovies[index];
                return (
                  <div key={index} className="relative aspect-[2/3] w-full rounded-xl overflow-hidden dark:bg-zinc-900/50 bg-gray-100 border dark:border-zinc-800 border-gray-200 shadow-lg group transition-colors">
                    {movie ? (
                      <Link href={`/movie/${movie.id}`} className="block w-full h-full">
                        {movie.posterPath ? (
                          <Image src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} alt={movie.title} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full dark:text-zinc-700 text-zinc-400 text-xs font-medium transition-colors">No Poster</div>
                        )}
                      </Link>
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full border border-dashed dark:border-zinc-800 border-gray-300 dark:text-zinc-700 text-zinc-400 transition-colors">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-center px-4">Empty Slot</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ANALYTICS & STATS */}
          {totalReviews > 0 && (
            <div className="dark:bg-zinc-900/30 bg-white border dark:border-zinc-800/50 border-gray-200 rounded-2xl p-6 md:p-8 mb-8 shadow-sm transition-colors">
              <div className="flex items-center gap-3 mb-8">
                <BarChart3 className="text-amber-500" size={24} />
                <h2 className="text-xl font-bold dark:text-white text-zinc-900 tracking-tight transition-colors">Rating Distribution</h2>
              </div>
              
              <div className="flex items-end justify-between h-40 gap-1 sm:gap-2">
                {ratingDistribution.map((count, index) => {
                  const heightPercentage = (count / maxRatingCount) * 100;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 gap-2 group">
                      <span className="text-[10px] dark:text-zinc-500 text-zinc-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{count}</span>
                      <div className="w-full dark:bg-zinc-800 bg-gray-100 rounded-t-sm relative overflow-hidden dark:group-hover:bg-zinc-700 group-hover:bg-gray-200 transition-colors" style={{ height: '100px' }}>
                        <div className="absolute bottom-0 w-full bg-amber-500 transition-all duration-1000 ease-out" style={{ height: `${heightPercentage}%` }}></div>
                      </div>
                      <span className="text-xs font-bold dark:text-zinc-400 text-zinc-500 group-hover:text-amber-500 transition-colors">{index + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* REVIEW DIARY */}
          <div className="dark:bg-zinc-900/30 bg-white border dark:border-zinc-800/50 border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-6 bg-red-600 rounded-sm"></div>
              <h2 className="text-2xl font-bold dark:text-white text-zinc-900 tracking-tight transition-colors">Recent Reviews</h2>
            </div>

            <div className="space-y-4">
              {user.reviews.length === 0 ? (
                <p className="dark:text-zinc-500 text-zinc-500 transition-colors">{user.name} hasn't written any reviews yet.</p>
              ) : (
                user.reviews.map((review) => (
                  <div key={review.id} className="dark:bg-zinc-950 bg-gray-50 border dark:border-zinc-800 border-gray-200 rounded-xl p-4 md:p-5 flex flex-col sm:flex-row gap-5 dark:hover:border-zinc-700 hover:border-gray-300 transition-colors">
                    <Link href={`/movie/${review.movie.id}`} className="w-20 sm:w-24 flex-shrink-0 relative aspect-[2/3] rounded-lg overflow-hidden border dark:border-zinc-800 border-gray-300 hidden sm:block transition-colors">
                      {review.movie.posterPath && <Image src={`https://image.tmdb.org/t/p/w200${review.movie.posterPath}`} alt={review.movie.title} fill sizes="100px" className="object-cover hover:scale-105 transition-transform" />}
                    </Link>
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Link href={`/movie/${review.movie.id}`} className="text-lg font-bold dark:text-white text-zinc-900 hover:text-red-500 dark:hover:text-red-500 transition-colors">{review.movie.title}</Link>
                          <div className="flex items-center gap-2 mt-1 text-xs dark:text-zinc-500 text-zinc-500 transition-colors">
                            <Clock size={12} />
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-md">
                          <Star size={12} className="text-amber-500 fill-amber-500" />
                          <span className="text-amber-500 font-bold text-xs">{review.rating}</span>
                        </div>
                      </div>
                      <p className="dark:text-zinc-400 text-zinc-600 text-sm leading-relaxed mt-2 flex-1 whitespace-pre-wrap line-clamp-3 transition-colors">{review.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}