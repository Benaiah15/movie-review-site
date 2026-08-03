"use client";

import { useState, useEffect } from "react";
import { Trash2, Loader2, MessageSquare, Star, Film, CornerDownRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link"; // Added Link import

export default function ManageReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const REVIEWS_PER_PAGE = 10; 

  useEffect(() => {
    fetch("/api/admin/reviews")
      .then(res => res.json())
      .then(data => { 
        setReviews(data); 
        setIsLoading(false); 
      });
  }, []);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
  const currentReviews = reviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      setDeletingId(reviewId);
      const res = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId })
      });

      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== reviewId));
        // Snap back a page if we delete the last item on the current page
        if (currentReviews.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
      } else {
        alert("Failed to delete review.");
      }
      setDeletingId(null);
    }
  };

  const handleDeleteComment = async (reviewId: string, commentId: string) => {
    if (confirm("Are you sure you want to delete this reply?")) {
      setDeletingId(commentId);
      const res = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId })
      });

      if (res.ok) {
        setReviews(reviews.map(r => {
          if (r.id === reviewId) {
            return { ...r, comments: r.comments.filter((c: any) => c.id !== commentId) };
          }
          return r;
        }));
      } else {
        alert("Failed to delete reply.");
      }
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-amber-600 mb-4" size={40} />
        <p className="dark:text-zinc-400 text-zinc-500 font-mono text-sm uppercase tracking-widest">Loading Review Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-zinc-800 border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight">Review Moderation</h1>
          <p className="text-sm dark:text-zinc-500 text-zinc-500 mt-1">Read and moderate user-submitted movie reviews and replies.</p>
        </div>
        <div className="bg-amber-600/10 border border-amber-600/20 text-amber-600 dark:text-amber-500 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold w-fit">
          <MessageSquare size={18} />
          Total Reviews: {reviews.length}
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden space-y-4">
        {currentReviews.map(review => (
          <div key={review.id} className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col min-w-0">
                <Link href={`/user/${review.user.id}`} className="font-bold dark:text-white text-slate-900 text-sm truncate hover:text-amber-500 transition-colors">
                  {review.user.name || "Anonymous"}
                </Link>
                <Link href={`/movie/${review.movie.id}`} className="text-xs dark:text-zinc-500 text-slate-500 flex items-center gap-1 truncate hover:text-amber-500 transition-colors">
                  <Film size={12}/> {review.movie.title}
                </Link>
              </div>
              <button 
                onClick={() => handleDeleteReview(review.id)}
                disabled={deletingId === review.id}
                className="p-2 text-slate-400 hover:text-white hover:bg-red-600 rounded-lg transition-all disabled:opacity-30 bg-slate-50 dark:bg-zinc-900 flex-shrink-0"
              >
                {deletingId === review.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </button>
            </div>
            
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded text-amber-600 dark:text-amber-500 w-fit">
               <Star size={12} className="fill-amber-500" />
               <span className="text-xs font-bold">{review.rating}/10</span>
            </div>
            <p className="text-sm dark:text-zinc-300 text-slate-700">{review.content}</p>

            {/* NESTED COMMENTS (MOBILE) */}
            {review.comments?.length > 0 && (
              <div className="mt-2 pt-3 border-t border-slate-100 dark:border-zinc-800/50 space-y-2">
                <p className="text-[10px] font-bold dark:text-zinc-500 text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <CornerDownRight size={12} /> Replies
                </p>
                {review.comments.map((comment: any) => (
                  <div key={comment.id} className="flex items-start justify-between gap-2 bg-slate-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800/50">
                    <div className="min-w-0 flex-1">
                      <Link href={`/user/${comment.user.id}`} className="text-xs font-bold dark:text-zinc-300 text-slate-700 block mb-0.5 hover:text-amber-500 transition-colors">
                        {comment.user.name || "Anonymous"}
                      </Link>
                      <span className="text-xs dark:text-zinc-400 text-slate-600 break-words">{comment.content}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(review.id, comment.id)}
                      disabled={deletingId === comment.id}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      {deletingId === comment.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-200 dark:border-zinc-800 text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-500">
              <th className="p-4 pl-6">User</th>
              <th className="p-4 w-[200px]">Movie & Rating</th>
              <th className="p-4 w-1/2">Review & Replies</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
            {currentReviews.map(review => (
              <tr key={`desktop-${review.id}`} className="hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors group align-top">
                <td className="p-4 pl-6">
                  <div className="flex flex-col">
                    <Link href={`/user/${review.user.id}`} className="font-bold dark:text-white text-slate-900 hover:text-amber-500 transition-colors w-fit">
                      {review.user.name || "Anonymous"}
                    </Link>
                    <span className="text-xs dark:text-zinc-500 text-slate-500">{review.user.email}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <Link href={`/movie/${review.movie.id}`} className="text-sm font-semibold dark:text-zinc-300 text-slate-700 truncate max-w-[180px] hover:text-amber-500 transition-colors" title={review.movie.title}>
                      {review.movie.title}
                    </Link>
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-500">
                      <Star size={12} className="fill-amber-500" />
                      <span className="text-xs font-bold">{review.rating}/10</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm dark:text-zinc-300 text-slate-700 mb-2">
                    {review.content}
                  </p>
                  
                  {/* NESTED COMMENTS (DESKTOP) */}
                  {review.comments?.length > 0 && (
                    <div className="mt-3 pl-3 border-l-2 dark:border-zinc-800 border-gray-200 space-y-2">
                      <p className="text-[10px] font-bold dark:text-zinc-500 text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <CornerDownRight size={12} /> Replies ({review.comments.length})
                      </p>
                      {review.comments.map((comment: any) => (
                        <div key={comment.id} className="flex items-start justify-between gap-2 bg-slate-100/50 dark:bg-zinc-900/50 p-2 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 transition-colors">
                          <div className="min-w-0 flex-1">
                            <Link href={`/user/${comment.user.id}`} className="text-xs font-bold dark:text-zinc-300 text-slate-700 mr-2 hover:text-amber-500 transition-colors inline-block">
                              {comment.user.name || "Anonymous"}
                            </Link>
                            <span className="text-xs dark:text-zinc-400 text-slate-600 break-words">{comment.content}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteComment(review.id, comment.id)}
                            disabled={deletingId === comment.id}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          >
                            {deletingId === comment.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className="p-4 pr-6 text-right">
                  <button 
                    onClick={() => handleDeleteReview(review.id)}
                    disabled={deletingId === review.id}
                    className="p-2.5 text-slate-400 hover:text-white hover:bg-red-600 rounded-lg transition-all disabled:opacity-30"
                  >
                    {deletingId === review.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 border-t dark:border-zinc-800 border-gray-200 pt-6">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              currentPage === 1 
                ? "opacity-30 cursor-not-allowed dark:text-zinc-500 text-zinc-400" 
                : "dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-gray-200 hover:border-amber-500 dark:hover:border-amber-500 dark:text-zinc-300 text-zinc-700 hover:text-amber-600"
            }`}
          >
            <ChevronLeft size={16} /> Prev
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold dark:text-zinc-500 text-zinc-400 uppercase tracking-wider hidden sm:block">Page</span>
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-600 text-white font-bold text-sm shadow-[0_0_10px_rgba(217,119,6,0.3)]">
              {currentPage}
            </span>
            <span className="text-sm font-bold dark:text-zinc-500 text-zinc-400 mx-1">of</span>
            <span className="w-8 h-8 flex items-center justify-center rounded-lg dark:bg-zinc-900 bg-gray-100 border dark:border-zinc-800 border-gray-200 dark:text-zinc-400 text-zinc-600 font-bold text-sm">
              {totalPages}
            </span>
          </div>

          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              currentPage === totalPages 
                ? "opacity-30 cursor-not-allowed dark:text-zinc-500 text-zinc-400" 
                : "dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-gray-200 hover:border-amber-500 dark:hover:border-amber-500 dark:text-zinc-300 text-zinc-700 hover:text-amber-600"
            }`}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}