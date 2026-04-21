import Link from "next/link";
import Image from "next/image";
import { Star, PlayCircle, Search, Film, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

export const dynamic = "force-dynamic";

// Hardcoded TMDB genre map for fast filtering
const GENRES = [
  { id: 28, name: "Action" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
];

const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

// Advanced fetch engine that handles both direct searches and filtered discovery
async function searchTMDB(query: string, page: number, genre?: string, year?: string, rating?: string) {
  try {
    let endpoint = "";
    
    if (query) {
      // If there's a text query, we MUST use the search endpoint (filters are ignored by TMDB here)
      endpoint = `/search/movie?query=${encodeURIComponent(query)}&page=${page}`;
    } else if (genre || year || rating) {
      // If there's no text query but filters exist, use the powerful DISCOVER endpoint
      let discoverParams = new URLSearchParams({ page: page.toString() });
      if (genre) discoverParams.append("with_genres", genre);
      if (year) discoverParams.append("primary_release_year", year);
      if (rating) discoverParams.append("vote_average.gte", rating);
      
      endpoint = `/discover/movie?${discoverParams.toString()}`;
    } else {
      // Default fallback
      endpoint = `/movie/popular?page=${page}`;
    }
    
    const res = await fetch(`https://api.themoviedb.org/3${endpoint}&api_key=${process.env.TMDB_API_KEY}`, { cache: 'no-store' });
    if (!res.ok) return { results: [], total_pages: 1 };
    return res.json();
  } catch (error) {
    return { results: [], total_pages: 1 };
  }
}

export default async function MoviesPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; genre?: string; year?: string; rating?: string }> }) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.q || "";
  const currentPage = parseInt(resolvedParams.page || "1");
  const selectedGenre = resolvedParams.genre || "";
  const selectedYear = resolvedParams.year || "";
  const selectedRating = resolvedParams.rating || "";

  const tmdbData = await searchTMDB(searchQuery, currentPage, selectedGenre, selectedYear, selectedRating);
  const movies = tmdbData.results || [];
  const totalPages = Math.min(tmdbData.total_pages || 1, 500);

  // Helper function to keep filters active when changing pages
  const buildPageUrl = (newPage: number) => {
    const params = new URLSearchParams();
    params.append("page", newPage.toString());
    if (searchQuery) params.append("q", searchQuery);
    if (selectedGenre) params.append("genre", selectedGenre);
    if (selectedYear) params.append("year", selectedYear);
    if (selectedRating) params.append("rating", selectedRating);
    return `/movies?${params.toString()}`;
  };

  return (
    <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pb-20 transition-colors duration-300">
      
      {/* ================= BRIGHTER MOVIES HERO ================= */}
      <div className="relative w-full h-[50vh] flex items-center justify-center border-b dark:border-zinc-800/50 border-gray-200 mb-12 overflow-hidden dark:bg-zinc-900 bg-gray-200 transition-colors duration-300">
        <div className="absolute inset-0 z-0 flex flex-wrap opacity-40">
          {movies.slice(0, 10).map((m: any) => (
            <div key={m.id} className="w-1/5 h-1/2 relative">
               {m.backdrop_path && <Image src={`https://image.tmdb.org/t/p/w500${m.backdrop_path}`} fill className="object-cover" alt="" />}
            </div>
          ))}
        </div>
        <div className="absolute inset-0 dark:bg-gradient-to-t dark:from-zinc-950 dark:via-zinc-950/60 dark:to-zinc-950/30 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent z-10"></div>
        
        <div className="relative z-20 text-center px-6 max-w-3xl">
          <Film className="text-red-600 mx-auto mb-6" size={56} />
          <h1 className="text-5xl md:text-7xl font-black dark:text-white text-zinc-900 tracking-tight mb-6 drop-shadow-2xl transition-colors">
            Explore the Catalog
          </h1>
          <p className="text-lg md:text-xl dark:text-white/90 text-zinc-700 font-medium drop-shadow-md transition-colors">
            {searchQuery 
              ? `Showing results for "${searchQuery}"` 
              : "Discover millions of movies using our advanced filters."}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        
        {/* ================= ADVANCED FILTER BAR ================= */}
        <div className="dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-gray-200 rounded-2xl p-4 md:p-6 mb-16 -mt-24 relative z-30 dark:shadow-[0_20px_40px_rgba(0,0,0,0.6)] shadow-xl transition-colors">
          <form method="GET" action="/movies" className="flex flex-col gap-4">
            
            {/* Top Row: Search */}
            <div className="relative w-full">
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search by specific title... (Note: Text search overrides filters)"
                className="w-full dark:bg-zinc-950 bg-gray-50 border dark:border-zinc-700 border-gray-300 dark:text-white text-zinc-900 px-5 py-3.5 rounded-xl pl-12 text-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 dark:text-zinc-400 text-zinc-500" size={20} />
            </div>

            {/* Bottom Row: Filters & Submit */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 dark:text-zinc-400 text-zinc-600 font-bold px-2 hidden lg:flex transition-colors">
                <SlidersHorizontal size={18} /> Filters:
              </div>
              
              <select name="genre" defaultValue={selectedGenre} className="w-full md:flex-1 dark:bg-zinc-950 bg-gray-50 border dark:border-zinc-700 border-gray-300 dark:text-zinc-300 text-zinc-700 px-4 py-3 rounded-xl focus:outline-none focus:border-red-500 cursor-pointer transition-colors">
                <option value="">Any Genre</option>
                {GENRES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>

              <select name="year" defaultValue={selectedYear} className="w-full md:flex-1 dark:bg-zinc-950 bg-gray-50 border dark:border-zinc-700 border-gray-300 dark:text-zinc-300 text-zinc-700 px-4 py-3 rounded-xl focus:outline-none focus:border-red-500 cursor-pointer transition-colors">
                <option value="">Any Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <select name="rating" defaultValue={selectedRating} className="w-full md:flex-1 dark:bg-zinc-950 bg-gray-50 border dark:border-zinc-700 border-gray-300 dark:text-zinc-300 text-zinc-700 px-4 py-3 rounded-xl focus:outline-none focus:border-red-500 cursor-pointer transition-colors">
                <option value="">Any Rating</option>
                <option value="8">8+ Stars (Masterpiece)</option>
                <option value="7">7+ Stars (Great)</option>
                <option value="6">6+ Stars (Good)</option>
                <option value="5">5+ Stars (Average)</option>
              </select>

              <button type="submit" className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-black transition-colors whitespace-nowrap shadow-lg">
                Apply & Search
              </button>
            </div>
          </form>
        </div>

        {/* ================= MOVIE GRID ================= */}
        {movies.length === 0 ? (
          <div className="text-center py-32 dark:bg-zinc-900/30 bg-white rounded-2xl border dark:border-zinc-800/50 border-gray-300 border-dashed transition-colors">
            <Search size={48} className="mx-auto dark:text-zinc-700 text-zinc-400 mb-4" />
            <p className="dark:text-zinc-500 text-zinc-500 text-lg mb-2 font-medium">No movies found matching your filters.</p>
            <Link href="/movies" className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-bold transition-colors">Clear all filters &rarr;</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10 md:gap-x-6">
              {movies.map((movie: any) => (
                <Link href={`/movie/${movie.id}`} key={movie.id} className="group flex flex-col gap-3">
                  <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden dark:bg-zinc-900 bg-gray-100 border dark:border-zinc-800 border-gray-200 shadow-lg transition-all duration-300 group-hover:-translate-y-2 dark:group-hover:shadow-[0_10px_30px_rgba(220,38,38,0.25)] group-hover:shadow-[0_10px_30px_rgba(220,38,38,0.15)] dark:group-hover:border-zinc-600 group-hover:border-gray-400">
                    {movie.poster_path ? (
                      <Image src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full dark:text-zinc-700 text-zinc-400 font-medium text-xs transition-colors">No Poster</div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <PlayCircle size={48} className="text-white/90 drop-shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300" />
                    </div>
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 flex items-center gap-1.5 shadow-lg">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      <span className="text-white text-xs font-bold">{movie.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="dark:text-white text-zinc-900 font-bold text-sm md:text-base truncate group-hover:text-red-500 transition-colors">{movie.title}</h3>
                    <p className="dark:text-zinc-500 text-zinc-500 text-xs mt-0.5 font-medium transition-colors">{movie.release_date ? movie.release_date.split("-")[0] : "Unknown"}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* ================= PAGINATION ================= */}
            {totalPages > 1 && (
              <div className="mt-20 flex items-center justify-center gap-2">
                {currentPage > 1 ? (
                  <Link href={buildPageUrl(currentPage - 1)} className="flex items-center gap-1 px-4 py-3 dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-gray-300 rounded-lg dark:text-white text-zinc-900 font-bold dark:hover:bg-zinc-800 hover:bg-gray-50 transition-colors">
                    <ChevronLeft size={18} /> Prev
                  </Link>
                ) : (
                  <button disabled className="flex items-center gap-1 px-4 py-3 dark:bg-zinc-900/50 bg-gray-100 border dark:border-zinc-800 border-gray-200 rounded-lg dark:text-zinc-600 text-zinc-400 font-bold cursor-not-allowed">
                    <ChevronLeft size={18} /> Prev
                  </button>
                )}

                <div className="px-6 py-3 dark:bg-zinc-950 bg-white border dark:border-zinc-800 border-gray-300 rounded-lg dark:text-zinc-300 text-zinc-700 font-medium">
                  Page <span className="dark:text-white text-zinc-900 font-bold">{currentPage}</span> of {totalPages}
                </div>

                {currentPage < totalPages ? (
                  <Link href={buildPageUrl(currentPage + 1)} className="flex items-center gap-1 px-4 py-3 dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-gray-300 rounded-lg dark:text-white text-zinc-900 font-bold dark:hover:bg-zinc-800 hover:bg-gray-50 transition-colors">
                    Next <ChevronRight size={18} />
                  </Link>
                ) : (
                  <button disabled className="flex items-center gap-1 px-4 py-3 dark:bg-zinc-900/50 bg-gray-100 border dark:border-zinc-800 border-gray-200 rounded-lg dark:text-zinc-600 text-zinc-400 font-bold cursor-not-allowed">
                    Next <ChevronRight size={18} />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}