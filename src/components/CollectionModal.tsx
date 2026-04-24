"use client";

import { useState, useEffect } from "react";
import { BookmarkPlus, Plus, X, Loader2, Check } from "lucide-react";
import { useSession } from "next-auth/react";

export default function CollectionModal({ movieId }: { movieId: string }) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch collections when modal opens
  useEffect(() => {
    if (isOpen && session) {
      setIsLoading(true);
      fetch("/api/collections")
        .then(res => res.json())
        .then(data => { setCollections(data); setIsLoading(false); })
        .catch(() => setIsLoading(false));
    }
  }, [isOpen, session]);

  if (!session) return null; // Only show for logged in users

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    
    setIsCreating(true);
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CREATE", name: newCollectionName })
    });

    if (res.ok) {
      const newCollection = await res.json();
      setCollections([{ ...newCollection, movies: [] }, ...collections]);
      setNewCollectionName("");
    }
    setIsCreating(false);
  };

  const handleToggleMovie = async (collectionId: string) => {
    // Optimistic UI update for instant feedback
    setCollections(collections.map(c => {
      if (c.id === collectionId) {
        const hasMovie = c.movies.some((m: any) => m.id === movieId);
        return { 
          ...c, 
          movies: hasMovie ? c.movies.filter((m:any) => m.id !== movieId) : [...c.movies, { id: movieId }] 
        };
      }
      return c;
    }));

    await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "TOGGLE", collectionId, movieId })
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 dark:bg-zinc-800 bg-gray-200 dark:hover:bg-zinc-700 hover:bg-gray-300 dark:text-white text-zinc-900 px-4 py-2 rounded-lg font-bold transition-all shadow-sm text-sm w-full md:w-auto justify-center"
      >
        <BookmarkPlus size={18} /> Save to List
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          {/* Modal (Bottom Sheet on Mobile, Centered on Desktop) */}
          <div className="relative w-full md:w-[400px] max-h-[85vh] dark:bg-zinc-950 bg-white md:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-4 duration-300">
            
            <div className="flex items-center justify-between p-5 border-b dark:border-zinc-800 border-gray-200">
              <h3 className="font-black text-xl dark:text-white text-zinc-900">Save to Collection</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 dark:bg-zinc-900 bg-gray-100 rounded-full dark:text-zinc-400 text-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {/* Create New Collection Input */}
              <form onSubmit={handleCreateCollection} className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={newCollectionName} 
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="New list name (e.g. Sci-Fi Binge)" 
                  className="flex-1 dark:bg-zinc-900 bg-gray-50 border dark:border-zinc-800 border-gray-300 rounded-lg px-4 py-2 text-sm dark:text-white text-zinc-900 focus:outline-none focus:border-red-500 transition-colors"
                />
                <button type="submit" disabled={isCreating || !newCollectionName.trim()} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center min-w-[40px]">
                  {isCreating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                </button>
              </form>

              {/* Collections List */}
              {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-red-500" size={32} /></div>
              ) : collections.length === 0 ? (
                <p className="text-center dark:text-zinc-500 text-zinc-500 text-sm py-8">You haven't created any lists yet.</p>
              ) : (
                <div className="space-y-2">
                  {collections.map(collection => {
                    const isAdded = collection.movies.some((m: any) => m.id === movieId);
                    return (
                      <button
                        key={collection.id}
                        onClick={() => handleToggleMovie(collection.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isAdded ? "dark:bg-red-500/10 bg-red-50 dark:border-red-500/30 border-red-200" : "dark:bg-zinc-900 bg-white dark:border-zinc-800 border-gray-200 dark:hover:border-zinc-700 hover:border-gray-300"}`}
                      >
                        <span className={`font-bold text-sm ${isAdded ? "dark:text-red-400 text-red-600" : "dark:text-zinc-300 text-zinc-700"}`}>
                          {collection.name}
                        </span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${isAdded ? "bg-red-600 border-red-600 text-white" : "dark:border-zinc-700 border-gray-300 dark:bg-zinc-800 bg-gray-100"}`}>
                          {isAdded && <Check size={14} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}