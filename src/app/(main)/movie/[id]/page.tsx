import db from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, Calendar, Clock, Film, Users, UserCircle, AlertCircle, Play, MonitorPlay, Clapperboard } from "lucide-react";
import ReviewSection from "@/components/ReviewSection";
import WatchlistButton from "@/components/WatchlistButton";
import TopFourButton from "@/components/TopFourButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CollectionModal from "@/components/CollectionModal";

export const revalidate = 60;

async function getTMDBDetails(tmdbId: number | null) {
  if (!tmdbId || isNaN(tmdbId)) return null;
  try {
    const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${process.env.TMDB_API_KEY}&append_to_response=credits,videos,similar,watch/providers`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null; 
  }
}

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  const rawId = resolvedParams.id;
  const isTmdbId = /^\d+$/.test(rawId); 

  let movie = await db.movie.findFirst({
    where: isTmdbId ? { tmdbId: parseInt(rawId) } : { id: rawId },
    include: {
      favoritedBy: { select: { id: true } }, 
      topFourUsers: { select: { id: true } }, 
      reviews: { 
        include: { 
          user: { select: { id: true, name: true, image: true, level: true } }, 
          likes: true, 
          comments: { include: { user: { select: { id: true, name: true, image: true, level: true } } } } 
        }, 
        orderBy: { createdAt: "desc" } 
      }
    }
  });

  if (!movie && isTmdbId) {
    const tmdbData = await getTMDBDetails(parseInt(rawId));
    if (!tmdbData) {
      return (
        <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 flex flex-col items-center justify-center text-center px-6 transition-colors duration-300">
          <AlertCircle className="text-red-500 mb-6" size={72} />
          <h1 className="text-3xl md:text-5xl font-black dark:text-white text-zinc-900 mb-4 transition-colors">Data Unavailable</h1>
          <p className="dark:text-zinc-400 text-zinc-600 max-w-md text-lg transition-colors">We couldn't fetch this movie from TMDB.</p>
        </div>
      );
    } 
    try {
      movie = await db.movie.create({
        data: {
          tmdbId: tmdbData.id,
          title: tmdbData.title || tmdbData.original_title || "Unknown Title",
          description: tmdbData.overview || "No synopsis available.",
          releaseDate: tmdbData.release_date || null,
          posterPath: tmdbData.poster_path || null,
          backdropPath: tmdbData.backdrop_path || null,
          rating: tmdbData.vote_average || 0,
          isPublished: true
        },
        include: { 
          favoritedBy: { select: { id: true } }, 
          topFourUsers: { select: { id: true } }, 
          reviews: { 
            include: { 
              user: { select: { id: true, name: true, image: true, level: true } }, 
              likes: true, 
              comments: { include: { user: { select: { id: true, name: true, image: true, level: true } } } } 
            } 
          } 
        }
      });
    } catch (err) {
      movie = {
        id: rawId, tmdbId: tmdbData.id, title: tmdbData.title || "Unknown Title", description: tmdbData.overview || "No synopsis.",
        releaseDate: tmdbData.release_date || null, posterPath: tmdbData.poster_path || null, backdropPath: tmdbData.backdrop_path || null,
        rating: tmdbData.vote_average || 0, favoritedBy: [], topFourUsers: [], reviews: []
      } as any;
    }
  }

  if (!movie) {
    return (
      <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 flex flex-col items-center justify-center text-center px-6 transition-colors duration-300">
        <Film className="dark:text-zinc-800 text-gray-300 mb-6 transition-colors" size={72} />
        <h1 className="text-3xl md:text-5xl font-black dark:text-white text-zinc-900 mb-4 transition-colors">Movie Not Found</h1>
      </div>
    );
  }

  const tmdbData = await getTMDBDetails(movie.tmdbId || parseInt(rawId));
  
  const director = tmdbData?.credits?.crew?.find((p: any) => p.job === "Director")?.name;
  const writers = tmdbData?.credits?.crew?.filter((p: any) => p.department === "Writing").slice(0, 2).map((w: any) => w.name).join(", ");
  const cast = tmdbData?.credits?.cast?.slice(0, 8) || [];
  
  const trailer = tmdbData?.videos?.results?.find((v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"));
  const streamingProviders = tmdbData?.["watch/providers"]?.results?.US?.flatrate?.slice(0, 4) || [];
  const similarMovies = tmdbData?.similar?.results?.slice(0, 10) || [];
  
  const isSaved = session?.user?.id ? movie.favoritedBy.some((u: any) => u.id === session.user.id) : false;
  const isPinned = session?.user?.id && movie.topFourUsers ? movie.topFourUsers.some((u: any) => u.id === session.user.id) : false;

  const formatMoney = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 transition-colors duration-300 overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-[65vh] md:h-[75vh] z-0 pointer-events-none">
        {movie.backdropPath ? (
          <Image src={`https://image.tmdb.org/t/p/w1280${movie.backdropPath}`} alt="Backdrop" fill priority unoptimized className="object-cover opacity-100" />
        ) : <div className="absolute inset-0 dark:bg-zinc-900 bg-gray-200 transition-colors" />}
        <div className="absolute inset-0 dark:bg-gradient-to-t bg-gradient-to-t dark:from-zinc-950 from-gray-50 dark:via-zinc-950/40 via-gray-50/40 to-transparent transition-colors" />
        <div className="absolute inset-0 dark:bg-gradient-to-r bg-gradient-to-r dark:from-zinc-950 from-gray-50 dark:via-zinc-950/20 via-gray-50/20 to-transparent transition-colors" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <div className="h-[40vh] md:h-[55vh] w-full dark:bg-gradient-to-t bg-gradient-to-t dark:from-zinc-950 from-gray-50 to-transparent transition-colors" />

        <div className="flex-1 dark:bg-zinc-950 bg-gray-50 px-4 sm:px-6 pb-20 transition-colors duration-300 w-full">
          <div className="max-w-7xl mx-auto -mt-24 md:-mt-32">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 w-full">
              
              <div className="w-full max-w-[240px] md:max-w-none md:w-[300px] flex-shrink-0 mx-auto md:mx-0 flex flex-col gap-4 sm:gap-6">
                <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden dark:shadow-[0_0_50px_rgba(0,0,0,0.6)] shadow-xl border dark:border-zinc-800 border-gray-200 dark:bg-zinc-900 bg-white transition-colors duration-300">
                  {movie.posterPath && <Image src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} alt={movie.title} fill priority sizes="300px" className="object-cover" />}
                </div>

                <div className="dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm transition-colors w-full overflow-hidden">
                  <p className="text-[10px] sm:text-xs font-bold dark:text-zinc-400 text-zinc-500 uppercase tracking-wider mb-2 sm:mb-3 flex items-center justify-center md:justify-start gap-2"><MonitorPlay size={12}/> Available on</p>
                  {streamingProviders.length > 0 ? (
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full">
                      {streamingProviders.map((provider: any) => (
                        <div key={provider.provider_id} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden border dark:border-zinc-700 border-gray-200 flex-shrink-0" title={provider.provider_name}>
                          <img src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`} alt={provider.provider_name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] sm:text-xs dark:text-zinc-500 text-zinc-400 font-medium text-center md:text-left truncate w-full">Not streaming currently.</p>
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col pt-2 md:pt-10 min-w-0 w-full text-center md:text-left overflow-hidden">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter dark:text-white text-zinc-900 mb-2 drop-shadow-lg transition-colors break-words w-full">{movie.title}</h1>
                {tmdbData?.tagline && <p className="text-base md:text-xl dark:text-zinc-400 text-zinc-600 font-medium italic mb-6 transition-colors break-words w-full">"{tmdbData.tagline}"</p>}

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-4 text-xs sm:text-sm font-semibold mb-6 w-full">
                  {movie.releaseDate && (
                    <div className="flex items-center gap-1.5 dark:bg-zinc-900/80 bg-white/80 backdrop-blur border dark:border-zinc-800 border-gray-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md dark:text-zinc-300 text-zinc-700 shadow-sm transition-colors">
                      <Calendar size={14} className="text-zinc-500" /> {movie.releaseDate.split("-")[0]}
                    </div>
                  )}
                  {tmdbData?.runtime ? (
                    <div className="flex items-center gap-1.5 dark:bg-zinc-900/80 bg-white/80 backdrop-blur border dark:border-zinc-800 border-gray-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md dark:text-zinc-300 text-zinc-700 shadow-sm transition-colors">
                      <Clock size={14} className="text-zinc-500" /> {tmdbData.runtime} mins
                    </div>
                  ) : null}
                  <div className="flex items-center gap-1.5 dark:bg-amber-500/10 bg-amber-50 backdrop-blur border dark:border-amber-500/20 border-amber-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md shadow-sm transition-colors">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span className="text-amber-600 dark:text-amber-500">{movie.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* CRITICAL FIX: Fully Centered on Mobile, Start-aligned on Desktop */}
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 w-full mb-8">
                  <div className="w-full sm:w-auto flex justify-center"><WatchlistButton movieId={movie.id} initialIsSaved={isSaved} /></div>
                  <div className="w-full sm:w-auto flex justify-center"><CollectionModal movieId={movie.id} /></div>
                  {session && (
                    <div className="w-full sm:w-auto flex justify-center"><TopFourButton movieId={movie.id} initialIsPinned={isPinned} /></div>
                  )}
                </div>

                {tmdbData?.genres && (
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8 w-full">
                    {tmdbData.genres.map((genre: any) => (
                      <span key={genre.id} className="px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider dark:text-zinc-300 text-zinc-700 border dark:border-zinc-700 border-gray-300 dark:bg-zinc-800/50 bg-gray-100 rounded-full transition-colors break-words">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

                {trailer && (
                  <div className="mb-12 w-full max-w-3xl mx-auto md:mx-0">
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border dark:border-zinc-800 border-gray-300 shadow-lg dark:bg-zinc-900 bg-black">
                      <iframe 
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${trailer.key}?rel=0&modestbranding=1`} 
                        title="YouTube video player" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}

                <div className="max-w-3xl mb-12 dark:bg-zinc-900/30 bg-white border dark:border-zinc-800/50 border-gray-200 p-5 sm:p-6 rounded-2xl shadow-sm transition-colors text-left mx-auto md:mx-0 w-full overflow-hidden">
                  <h3 className="text-lg sm:text-xl font-bold dark:text-white text-zinc-900 mb-4 flex items-center gap-2 transition-colors"><Film size={18} className="text-red-500 flex-shrink-0"/> Storyline</h3>
                  <p className="dark:text-zinc-300 text-zinc-700 text-sm sm:text-lg leading-relaxed mb-8 transition-colors break-words whitespace-pre-wrap overflow-hidden w-full max-w-full">
                    {movie.description || "No overview available."}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t dark:border-zinc-800/50 border-gray-200 pt-6 w-full">
                    {director && (
                      <div className="w-full overflow-hidden">
                        <p className="text-[10px] sm:text-xs font-bold dark:text-zinc-500 text-zinc-500 uppercase tracking-wider mb-1">Director</p>
                        <p className="text-sm sm:text-base dark:text-white text-zinc-900 font-medium transition-colors break-words w-full">{director}</p>
                      </div>
                    )}
                    {writers && (
                      <div className="w-full overflow-hidden">
                        <p className="text-[10px] sm:text-xs font-bold dark:text-zinc-500 text-zinc-500 uppercase tracking-wider mb-1">Writers</p>
                        <p className="text-sm sm:text-base dark:text-white text-zinc-900 font-medium transition-colors break-words w-full">{writers}</p>
                      </div>
                    )}
                  </div>
                </div>

                {cast.length > 0 && (
                  <div className="mb-12 w-full mx-auto md:mx-0 text-left overflow-hidden">
                    <h3 className="text-xl font-bold dark:text-white text-zinc-900 mb-6 flex items-center gap-2 transition-colors"><Users size={20} className="text-red-500 flex-shrink-0"/> Top Cast</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                      {cast.map((person: any) => (
                        <Link href={`/person/${person.id}`} key={person.id} className="flex items-center gap-3 dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-gray-200 p-2.5 rounded-xl dark:hover:bg-zinc-800 hover:bg-gray-50 shadow-sm transition-colors group w-full overflow-hidden">
                          <div className="w-12 h-12 rounded-full overflow-hidden dark:bg-zinc-800 bg-gray-100 flex-shrink-0 border-2 border-transparent group-hover:border-red-500 transition-colors">
                            {person.profile_path ? (
                              <img src={`https://image.tmdb.org/t/p/w200${person.profile_path}`} alt={person.name} className="w-full h-full object-cover" />
                            ) : <UserCircle className="w-full h-full dark:text-zinc-600 text-zinc-400 p-2 transition-colors"/>}
                          </div>
                          <div className="overflow-hidden min-w-0 w-full">
                            <p className="text-sm font-bold dark:text-white text-zinc-900 truncate dark:group-hover:text-red-400 group-hover:text-red-600 transition-colors w-full">{person.name}</p>
                            <p className="text-xs dark:text-zinc-500 text-zinc-500 truncate transition-colors w-full">{person.character}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {tmdbData && (tmdbData.budget > 0 || tmdbData.revenue > 0) && (
                  <div className="flex flex-col sm:flex-row gap-4 mb-12 w-full mx-auto md:mx-0 text-left">
                    {tmdbData.budget > 0 && (
                      <div className="dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-gray-200 p-4 rounded-xl flex-1 shadow-sm transition-colors overflow-hidden">
                        <p className="dark:text-zinc-500 text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1 transition-colors">Budget</p>
                        <p className="dark:text-white text-zinc-900 font-black text-xl transition-colors truncate">{formatMoney(tmdbData.budget)}</p>
                      </div>
                    )}
                    {tmdbData.revenue > 0 && (
                      <div className="dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-gray-200 p-4 rounded-xl flex-1 shadow-sm transition-colors overflow-hidden">
                        <p className="dark:text-zinc-500 text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1 transition-colors">Box Office</p>
                        <p className="dark:text-emerald-400 text-emerald-600 font-black text-xl transition-colors truncate">{formatMoney(tmdbData.revenue)}</p>
                      </div>
                    )}
                  </div>
                )}

                {similarMovies.length > 0 && (
                  <div className="mb-12 pt-12 border-t dark:border-zinc-800 border-gray-200 transition-colors w-full text-left overflow-hidden">
                    <h3 className="text-xl font-bold dark:text-white text-zinc-900 mb-2 flex items-center gap-2 transition-colors"><Clapperboard size={20} className="text-red-500 flex-shrink-0"/> More Like This</h3>
                    
                    <div className="flex gap-4 overflow-x-auto py-6 px-2 -mx-2 snap-x scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full">
                      {similarMovies.map((sm: any) => (
                        <Link href={`/movie/${sm.id}`} key={sm.id} className="w-[130px] md:w-[160px] flex-shrink-0 snap-start group flex flex-col gap-2">
                          <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden dark:bg-zinc-900 bg-gray-200 border dark:border-zinc-800 border-gray-300 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_20px_rgba(220,38,38,0.2)] dark:group-hover:border-red-500/50 group-hover:border-red-500/50">
                            {sm.poster_path ? (
                              <Image src={`https://image.tmdb.org/t/p/w300${sm.poster_path}`} alt={sm.title} fill sizes="160px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full dark:text-zinc-700 text-zinc-400 font-medium text-xs">N/A</div>
                            )}
                          </div>
                          <h4 className="dark:text-zinc-300 text-zinc-700 font-semibold text-sm truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors w-full">{sm.title}</h4>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="w-full max-w-full overflow-hidden text-left">
                  <ReviewSection movieId={movie.id} reviews={movie.reviews} />
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}