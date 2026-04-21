"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Plus, Calendar, Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  vote_average: number;
  overview: string;
}

// Added the prop here
interface MovieSearchProps {
  existingTmdbIds?: number[];
}

export default function MovieSearch({ existingTmdbIds = [] }: MovieSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState<number | null>(null);
  const [importedIds, setImportedIds] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Helper function to check if the movie is in the database OR was just imported this session
  const isMovieAdded = (id: number) => existingTmdbIds.includes(id) || importedIds.includes(id);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(query)}`);
          const data = await res.json();
          setResults(data.results?.slice(0, 6) || []);
          setIsOpen(true);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleImport = async (movie: TMDBMovie) => {
    setImportingId(movie.id);
    try {
      const res = await fetch("/api/movies/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: movie.id,
          title: movie.title,
          overview: movie.overview,
          release_date: movie.release_date,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
        }),
      });

      if (res.ok) {
        setImportedIds((prev) => [...prev, movie.id]);
        router.refresh(); 
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to import movie.");
      }
    } catch (error) {
      console.error("Import error:", error);
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="flex-1 relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={18} />
        <input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 2 && setIsOpen(true)}
          type="text" 
          placeholder="Search TMDB for movies to import..." 
          className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 animate-spin" size={18} />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto">
            {results.map((movie) => (
              <div key={movie.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer border-b border-slate-100 dark:border-zinc-900 last:border-none transition-colors">
                <div className="h-16 w-12 bg-slate-200 dark:bg-zinc-800 rounded flex-shrink-0 overflow-hidden">
                  {movie.poster_path && <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt="" className="h-full w-full object-cover"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{movie.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400"><Calendar size={12} />{movie.release_date?.split("-")[0]}</span>
                    <span className="flex items-center gap-1 text-xs text-amber-500 font-medium"><Star size={12} fill="currentColor" />{movie.vote_average.toFixed(1)}</span>
                  </div>
                </div>
                <button 
                  // Now using the updated isMovieAdded function
                  onClick={() => !isMovieAdded(movie.id) && handleImport(movie)}
                  disabled={importingId === movie.id || isMovieAdded(movie.id)}
                  className={cn("p-2 rounded-full transition-all", isMovieAdded(movie.id) ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 cursor-default" : "hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 active:scale-90")}
                >
                  {importingId === movie.id ? <Loader2 size={20} className="animate-spin" /> : isMovieAdded(movie.id) ? <Check size={20} /> : <Plus size={20} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
}