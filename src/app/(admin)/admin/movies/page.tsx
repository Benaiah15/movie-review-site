import { Trash2, Edit3 } from "lucide-react";
import MovieSearch from "@/components/admin/MovieSearch";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import Link from "next/link"; 

// 1. Fetch the movies directly from the database
async function getMovies() {
  const movies = await db.movie.findMany({
    orderBy: { createdAt: "desc" },
  });
  return movies;
}

// 2. Server Action for Deletion
async function deleteMovie(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  
  if (id) {
    await db.movie.delete({
      where: { id },
    });
    revalidatePath("/admin/movies");
  }
}

export default async function AdminMoviesPage() {
  const movies = await getMovies();
  
  // Extract all TMDB IDs currently in the database to pass to the search component
  const existingTmdbIds = movies.map((m) => m.tmdbId).filter((id): id is number => id !== null);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">Manage Movies</h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm transition-colors">
            You have {movies.length} movies in your local database.
          </p>
        </div>
      </div>

      {/* Search Bar Container */}
      <div className="flex items-center gap-4 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-zinc-900 shadow-sm transition-colors duration-300">
        <MovieSearch existingTmdbIds={existingTmdbIds} /> 
      </div>

      {/* Database Table - Now 100% Mobile Responsive without horizontal scrolling */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-900 overflow-hidden shadow-sm transition-colors duration-300">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-200 dark:border-zinc-900 transition-colors">
            <tr>
              <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-700 dark:text-zinc-300 transition-colors">Movie</th>
              {/* These two columns hide on mobile (hidden md:table-cell) */}
              <th className="hidden md:table-cell px-6 py-4 text-sm font-semibold text-slate-700 dark:text-zinc-300 transition-colors whitespace-nowrap">Released</th>
              <th className="hidden md:table-cell px-6 py-4 text-sm font-semibold text-slate-700 dark:text-zinc-300 transition-colors">Rating</th>
              <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-700 dark:text-zinc-300 text-right transition-colors w-[80px] md:w-[120px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-900 transition-colors">
            {movies.length === 0 ? (
              <tr>
                <td className="px-6 py-12 text-center text-slate-400 dark:text-zinc-500 transition-colors" colSpan={4}>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium">Your database is empty.</p>
                    <p className="text-xs">Search TMDB above to import your first movie.</p>
                  </div>
                </td>
              </tr>
            ) : (
              movies.map((movie) => (
                <tr key={movie.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors group">
                  <td className="px-4 md:px-6 py-4 max-w-[200px] md:max-w-none">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="h-14 w-10 md:h-16 md:w-11 rounded bg-slate-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-zinc-800 transition-colors">
                        {movie.posterPath && (
                          <img 
                            src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`} 
                            alt={movie.title} 
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm md:text-base text-slate-900 dark:text-white truncate transition-colors">
                          {movie.title}
                        </p>
                        <p className="text-[10px] md:text-xs text-slate-500 dark:text-zinc-500 truncate transition-colors mt-0.5">ID: {movie.tmdbId}</p>
                        
                        {/* MOBILE ONLY: Rating moves here on small screens so it's not lost */}
                        <div className="md:hidden flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-500 transition-colors mt-1">
                          <span className="text-amber-500">★</span>
                          {movie.rating.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Desktop Only Columns */}
                  <td className="hidden md:table-cell px-6 py-4 text-sm text-slate-600 dark:text-zinc-400 whitespace-nowrap transition-colors">
                    {movie.releaseDate || "N/A"}
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-500 transition-colors">
                      <span className="text-amber-500">★</span>
                      {movie.rating.toFixed(1)}
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 md:px-6 py-4 align-middle">
                    {/* Always visible on mobile, hover on desktop */}
                    <div className="flex justify-end items-center gap-1 md:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/admin/movies/${movie.id}/edit`}
                        className="p-1.5 md:p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all" 
                        title="Edit"
                      >
                        <Edit3 size={16} className="md:w-5 md:h-5" />
                      </Link>
                      <form action={deleteMovie}>
                        <input type="hidden" name="id" value={movie.id} />
                        <button 
                          type="submit"
                          className="p-1.5 md:p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all" 
                          title="Delete"
                        >
                          <Trash2 size={16} className="md:w-5 md:h-5" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}