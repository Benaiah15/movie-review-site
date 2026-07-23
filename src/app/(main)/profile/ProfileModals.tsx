"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { X, PlayCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { getCinephileBadge } from "@/lib/gamification";

export default function ProfileModals({
  followers,
  following,
  collections,
}: {
  followers: any[];
  following: any[];
  collections: any[];
}) {
  const [mounted, setMounted] = useState(false);
  const [collectionPage, setCollectionPage] = useState(1);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  const modal = searchParams.get("modal");
  const currentTab = searchParams.get("tab") || "activity";
  const page = searchParams.get("page") || "1";
  const collectionId = searchParams.get("collectionId");

  // Mount portal on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock the scroll when any modal is open
  useEffect(() => {
    if (modal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modal]);

  // Reset pagination when switching collections
  useEffect(() => {
    setCollectionPage(1);
  }, [collectionId]);

  if (!mounted || !modal) return null;

  const handleClose = () => {
    router.push(`?tab=${currentTab}&page=${page}`, { scroll: false });
  };

  // Pagination Logic for Collection Details
  const activeCollection = collectionId ? collections.find(c => c.id === collectionId) : null;
  const MOVIES_PER_PAGE = 8; // Shows 8 movies per modal page
  const totalCollectionPages = activeCollection ? Math.ceil(activeCollection.movies.length / MOVIES_PER_PAGE) : 0;
  const paginatedMovies = activeCollection ? activeCollection.movies.slice((collectionPage - 1) * MOVIES_PER_PAGE, collectionPage * MOVIES_PER_PAGE) : [];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Dark Blur Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      {/* FOLLOWERS MODAL */}
      {modal === "followers" && (
        <div className="relative dark:bg-zinc-900 bg-white w-full max-w-md max-h-[75vh] flex flex-col rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b dark:border-zinc-800 border-gray-200 shrink-0">
            <h3 className="text-xl font-bold dark:text-white text-zinc-900">Followers ({followers.length})</h3>
            <button onClick={handleClose} className="p-2 dark:bg-zinc-800 bg-gray-100 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"><X size={16}/></button>
          </div>
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {followers.length === 0 ? (
              <p className="text-center dark:text-zinc-500 text-zinc-500 py-4">No followers yet.</p>
            ) : (
              followers.map((f: any) => (
                <Link href={`/user/${f.follower.id}`} key={f.follower.id} onClick={handleClose} className="flex items-center gap-3 p-2 rounded-xl dark:hover:bg-zinc-800 hover:bg-gray-50 transition-colors">
                  {f.follower.image ? <img src={f.follower.image} className="w-10 h-10 rounded-full object-cover" alt=""/> : <div className="w-10 h-10 rounded-full dark:bg-zinc-800 bg-gray-200 flex items-center justify-center font-bold">{f.follower.name?.charAt(0)}</div>}
                  <div>
                    <p className="font-bold dark:text-white text-zinc-900 text-sm flex items-center gap-1">{f.follower.name} <span className="text-xs">{getCinephileBadge(f.follower.level).icon}</span></p>
                    <p className="text-xs dark:text-zinc-500 text-zinc-500">Lvl {f.follower.level}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* FOLLOWING MODAL */}
      {modal === "following" && (
        <div className="relative dark:bg-zinc-900 bg-white w-full max-w-md max-h-[75vh] flex flex-col rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b dark:border-zinc-800 border-gray-200 shrink-0">
            <h3 className="text-xl font-bold dark:text-white text-zinc-900">Following ({following.length})</h3>
            <button onClick={handleClose} className="p-2 dark:bg-zinc-800 bg-gray-100 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"><X size={16}/></button>
          </div>
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {following.length === 0 ? (
              <p className="text-center dark:text-zinc-500 text-zinc-500 py-4">Not following anyone yet.</p>
            ) : (
              following.map((f: any) => (
                <Link href={`/user/${f.following.id}`} key={f.following.id} onClick={handleClose} className="flex items-center gap-3 p-2 rounded-xl dark:hover:bg-zinc-800 hover:bg-gray-50 transition-colors">
                  {f.following.image ? <img src={f.following.image} className="w-10 h-10 rounded-full object-cover" alt=""/> : <div className="w-10 h-10 rounded-full dark:bg-zinc-800 bg-gray-200 flex items-center justify-center font-bold">{f.following.name?.charAt(0)}</div>}
                  <div>
                    <p className="font-bold dark:text-white text-zinc-900 text-sm flex items-center gap-1">{f.following.name} <span className="text-xs">{getCinephileBadge(f.following.level).icon}</span></p>
                    <p className="text-xs dark:text-zinc-500 text-zinc-500">Lvl {f.following.level}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* COLLECTION DETAILS MODAL (WITH PAGINATION) */}
      {modal === "collection" && activeCollection && (
        <div className="relative dark:bg-zinc-900 bg-white w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b dark:border-zinc-800 border-gray-200 shrink-0">
            <div>
              <h3 className="text-xl font-black dark:text-white text-zinc-900">{activeCollection.name}</h3>
              <p className="text-xs font-semibold dark:text-zinc-500 text-zinc-500 uppercase tracking-wider mt-1">{activeCollection.movies.length} Movies</p>
            </div>
            <button onClick={handleClose} className="p-2 dark:bg-zinc-800 bg-gray-100 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"><X size={16}/></button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {paginatedMovies.map((movie: any) => (
                <Link prefetch={false} href={`/movie/${movie.id}`} key={movie.id} onClick={handleClose} className="group flex flex-col gap-2 w-full overflow-hidden">
                  <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden dark:bg-zinc-800 bg-gray-200 border dark:border-zinc-700 border-gray-300 shadow-md group-hover:border-purple-500/50 transition-all">
                    {movie.posterPath ? (
                      <Image src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} alt={movie.title} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full dark:text-zinc-600 text-zinc-400 font-medium text-xs">N/A</div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <PlayCircle size={40} className="text-white/90 drop-shadow-lg scale-90 group-hover:scale-100 transition-transform" />
                    </div>
                  </div>
                  <h4 className="dark:text-white text-zinc-900 font-bold text-xs sm:text-sm truncate group-hover:text-purple-500 transition-colors w-full">{movie.title}</h4>
                </Link>
              ))}
            </div>
          </div>

          {/* Modal Pagination Bar (Only shows if collection has > 8 movies) */}
          {totalCollectionPages > 1 && (
            <div className="p-4 border-t dark:border-zinc-800 border-gray-200 shrink-0 flex items-center justify-between bg-gray-50 dark:bg-zinc-950/50">
              <button 
                onClick={() => setCollectionPage(p => Math.max(1, p - 1))}
                disabled={collectionPage === 1}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all dark:bg-zinc-800 bg-white border dark:border-zinc-700 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-zinc-700"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              
              <span className="text-sm font-bold dark:text-zinc-400 text-zinc-600">
                Page {collectionPage} of {totalCollectionPages}
              </span>

              <button 
                onClick={() => setCollectionPage(p => Math.min(totalCollectionPages, p + 1))}
                disabled={collectionPage === totalCollectionPages}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all dark:bg-zinc-800 bg-white border dark:border-zinc-700 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-zinc-700"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>,
    document.body
  );
}