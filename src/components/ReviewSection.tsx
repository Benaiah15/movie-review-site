"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, Loader2, UserCircle, ThumbsUp, Reply, UserPlus, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCinephileBadge } from "@/lib/gamification";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: { id: string; name: string | null; image: string | null; level: number; };
}

interface Review {
  id: string;
  rating: number;
  content: string;
  createdAt: Date;
  user: { id: string; name: string | null; image: string | null; level: number; };
  likes: { userId: string }[]; 
  comments: Comment[]; 
}

export default function ReviewSection({ movieId, reviews }: { movieId: string, reviews: Review[] }) {
  const { data: session, status } = useSession(); 
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const REVIEWS_PER_PAGE = 5; // Adjust this number to show more/less reviews per page

  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
  const currentReviews = reviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);

  const currentUserId = (session?.user as any)?.id; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, rating, content }),
      });

      if (res.ok) {
        setIsFormOpen(false);
        setContent("");
        setRating(5);
        setCurrentPage(1); // Snap back to page 1 to see the new review!
        router.refresh(); 
      } else {
        const error = await res.text();
        alert(error || "Failed to submit review.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="pt-8 mt-12 border-t dark:border-zinc-800 border-gray-200 flex justify-center py-12 transition-colors">
        <Loader2 className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  return (
    <div className="pt-8 mt-8 border-t dark:border-zinc-800 border-gray-200 transition-colors w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl sm:text-2xl font-bold dark:text-white text-zinc-900 flex items-center gap-2 transition-colors">
            <MessageSquare className="text-red-600 flex-shrink-0" size={20} />
            Community Reviews
          </h3>
          <span className="text-xs font-bold dark:text-zinc-400 text-zinc-500 dark:bg-zinc-800 bg-gray-200 px-2.5 py-1 rounded-md">
            {reviews.length} Total
          </span>
        </div>
        
        {session ? (
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold tracking-wide rounded-lg transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] w-full sm:w-auto"
          >
            {isFormOpen ? "Cancel Review" : "+ Write a Review"}
          </button>
        ) : null}
      </div>

      {!session && (
        <div className="dark:bg-zinc-900/50 bg-gray-50 border dark:border-zinc-800 border-gray-200 rounded-xl p-4 sm:p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors w-full">
          <p className="dark:text-zinc-400 text-zinc-600 text-sm transition-colors text-center sm:text-left">Join the community to share your thoughts on this movie.</p>
          <Link href="/login" className="px-6 py-2 dark:bg-white bg-zinc-900 dark:text-black text-white font-bold text-sm rounded-lg dark:hover:bg-zinc-200 hover:bg-zinc-800 transition whitespace-nowrap w-full sm:w-auto text-center">
            Sign In
          </Link>
        </div>
      )}

      {isFormOpen && session && (
        <form onSubmit={handleSubmit} className="dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-gray-200 rounded-xl p-4 sm:p-6 mb-8 animate-in slide-in-from-top-4 fade-in duration-300 transition-colors shadow-sm w-full">
          <div className="mb-6 w-full">
            <label className="block text-sm font-semibold dark:text-zinc-400 text-zinc-700 mb-2 transition-colors">Your Rating (1-10)</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
              <input type="range" min="1" max="10" value={rating} onChange={(e) => setRating(parseInt(e.target.value))} className="w-full sm:max-w-xs accent-red-600"/>
              <div className="flex items-center justify-center gap-1 dark:bg-zinc-950 bg-gray-50 px-3 py-1.5 rounded-lg border dark:border-zinc-800 border-gray-200 transition-colors w-24">
                <Star size={16} className="text-amber-500 fill-amber-500" />
                <span className="dark:text-white text-zinc-900 font-bold transition-colors">{rating}</span>
              </div>
            </div>
          </div>

          <div className="mb-6 w-full max-w-full">
            <label className="block text-sm font-semibold dark:text-zinc-400 text-zinc-700 mb-2 transition-colors">Your Thoughts</label>
            <textarea required rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder="What did you think of the movie?" className="w-full max-w-full px-4 py-3 dark:bg-zinc-950 bg-gray-50 border dark:border-zinc-800 border-gray-300 rounded-lg text-sm dark:text-white text-zinc-900 focus:outline-none focus:border-red-500 transition-all resize-none"/>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-6 py-2.5 dark:bg-white bg-zinc-900 dark:text-black text-white font-bold text-sm rounded-lg dark:hover:bg-zinc-200 hover:bg-zinc-800 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? "Publishing..." : "Publish Review"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4 sm:space-y-6 w-full">
        {reviews.length === 0 ? (
          <div className="dark:bg-zinc-900/30 bg-white border dark:border-zinc-800/50 border-gray-300 rounded-xl p-8 text-center border-dashed transition-colors w-full">
            <p className="text-sm dark:text-zinc-500 text-zinc-500 transition-colors">No reviews yet. Be the first!</p>
          </div>
        ) : (
          // Use currentReviews instead of reviews
          currentReviews.map((review) => {
            const badge = getCinephileBadge(review.user.level || 1);
            return (
              <div key={review.id} className="dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm transition-colors w-full overflow-hidden">
                <div className="flex flex-wrap items-start justify-between mb-3 gap-2 w-full">
                  
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Link href={`/user/${review.user.id}`} className="w-8 h-8 sm:w-10 sm:h-10 dark:bg-zinc-800 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-transparent hover:border-red-500 transition-colors mt-0.5">
                      {review.user.image ? <img src={review.user.image} alt={review.user.name || "User"} className="w-full h-full object-cover" /> : <UserCircle size={20} className="dark:text-zinc-500 text-zinc-400" />}
                    </Link>
                    
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 w-full pr-1">
                        <Link href={`/user/${review.user.id}`} className="font-bold text-sm sm:text-base dark:text-white text-zinc-900 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1">
                          <span className="break-words line-clamp-1">{review.user.name || "Anonymous"}</span> 
                          <span className="text-[10px] sm:text-xs flex-shrink-0" title={`Level ${review.user.level || 1}`}>{badge.icon}</span>
                        </Link>
                        <MiniFollowButton targetUserId={review.user.id} currentUserId={currentUserId} />
                      </div>
                      
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold dark:text-zinc-500 text-zinc-500 transition-colors mt-0.5">
                        Lvl {review.user.level || 1} • {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 dark:bg-amber-500/10 bg-amber-50 border dark:border-amber-500/20 border-amber-200 px-2 py-0.5 sm:py-1 rounded-md transition-colors flex-shrink-0">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-amber-600 dark:text-amber-500 font-bold text-xs sm:text-sm">{review.rating}</span>
                  </div>
                </div>
                
                <p className="text-xs sm:text-sm dark:text-zinc-300 text-zinc-700 leading-relaxed whitespace-pre-wrap mb-3 transition-colors break-words overflow-hidden w-full max-w-full">{review.content}</p>
                
                <div className="flex items-center gap-4 sm:gap-6 pt-3 border-t dark:border-zinc-800/50 border-gray-100 transition-colors w-full">
                  <LikeButton reviewId={review.id} initialLikes={review.likes} currentUserId={currentUserId} />
                  <ReplyInterface reviewId={review.id} currentUserId={currentUserId} commentCount={review.comments.length} />
                </div>

                {review.comments.length > 0 && (
                  <div className="mt-4 pl-3 sm:pl-4 ml-1 sm:ml-4 border-l dark:border-zinc-800 border-gray-200 space-y-3 transition-colors w-full">
                    {review.comments.map((comment) => {
                      const cBadge = getCinephileBadge(comment.user.level || 1);
                      return (
                        <div key={comment.id} className="dark:bg-zinc-950/50 bg-gray-50 rounded-lg p-2.5 sm:p-3 border dark:border-zinc-800/50 border-gray-200 transition-colors w-full overflow-hidden">
                          <div className="flex items-start gap-2 mb-1.5 w-full flex-wrap">
                            <Link href={`/user/${comment.user.id}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity mt-0.5">
                              {comment.user.image ? <img src={comment.user.image} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" /> : <UserCircle size={16} className="dark:text-zinc-500 text-zinc-400 flex-shrink-0" />}
                            </Link>
                            
                            <div className="flex items-center flex-wrap gap-1.5 flex-1 min-w-0">
                              <Link href={`/user/${comment.user.id}`} className="font-bold text-xs sm:text-sm dark:text-zinc-300 text-zinc-700 hover:text-red-500 transition-colors flex items-center gap-1">
                                <span className="break-words line-clamp-1">{comment.user.name || "Anonymous"}</span>
                                <span className="text-[10px] flex-shrink-0" title={`Level ${comment.user.level || 1}`}>{cBadge.icon}</span>
                              </Link>
                              <MiniFollowButton targetUserId={comment.user.id} currentUserId={currentUserId} />
                            </div>
                            
                            <span className="text-[9px] uppercase font-bold dark:text-zinc-600 text-zinc-500 transition-colors flex-shrink-0 w-full sm:w-auto mt-1 sm:mt-0 sm:ml-auto">{new Date(comment.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                          </div>
                          <p className="text-xs sm:text-sm dark:text-zinc-400 text-zinc-600 transition-colors break-words whitespace-pre-wrap overflow-hidden w-full max-w-full">{comment.content}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* --- STYLISH CLIENT-SIDE PAGINATION --- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 border-t dark:border-zinc-800 border-gray-200 pt-6">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              currentPage === 1 
                ? "opacity-30 cursor-not-allowed dark:text-zinc-500 text-zinc-400" 
                : "dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-gray-200 hover:border-red-500 dark:hover:border-red-500 dark:text-zinc-300 text-zinc-700 hover:text-red-600"
            }`}
          >
            <ChevronLeft size={16} /> Prev
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold dark:text-zinc-500 text-zinc-400 uppercase tracking-wider hidden sm:block">Page</span>
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-600 text-white font-bold text-sm shadow-[0_0_10px_rgba(220,38,38,0.3)]">
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
                : "dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-gray-200 hover:border-red-500 dark:hover:border-red-500 dark:text-zinc-300 text-zinc-700 hover:text-red-600"
            }`}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

    </div>
  );
}

// --- SUB-COMPONENTS ---
// (These remain completely unchanged from your original code!)

function MiniFollowButton({ targetUserId, currentUserId }: { targetUserId: string, currentUserId?: string }) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId || currentUserId === targetUserId) {
      setIsLoading(false);
      return;
    }
    fetch(`/api/follow/check?targetId=${targetUserId}`)
      .then(res => res.json())
      .then(data => {
        setIsFollowing(data.isFollowing);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [targetUserId, currentUserId]);

  if (!currentUserId || currentUserId === targetUserId) return null;

  const handleQuickFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId })
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.following);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleQuickFollow} 
      disabled={isLoading}
      className={`flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full transition-colors border flex-shrink-0 ${
        isFollowing 
          ? "dark:bg-zinc-800 bg-gray-200 dark:text-zinc-400 text-zinc-600 dark:border-zinc-700 border-gray-300" 
          : "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20"
      }`}
    >
      {isLoading ? <Loader2 size={10} className="animate-spin" /> : isFollowing ? <UserCheck size={10}/> : <UserPlus size={10}/>}
      <span className="hidden sm:inline">{isFollowing ? "Following" : "Follow"}</span>
    </button>
  );
}

function LikeButton({ reviewId, initialLikes, currentUserId }: { reviewId: string, initialLikes: {userId: string}[], currentUserId?: string }) {
  const router = useRouter();
  const hasLikedInitially = currentUserId ? initialLikes.some((like) => like.userId === currentUserId) : false;
  const [isLiked, setIsLiked] = useState(hasLikedInitially);
  const [likeCount, setLikeCount] = useState(initialLikes.length);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!currentUserId) return alert("You must be signed in to upvote reviews.");
    if (isLiking) return;

    setIsLiked(!isLiked);
    setLikeCount((prev) => isLiked ? prev - 1 : prev + 1);
    setIsLiking(true);

    try {
      const res = await fetch(`/api/reviews/${reviewId}/like`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      router.refresh(); 
    } catch (error) {
      setIsLiked(isLiked);
      setLikeCount((prev) => isLiked ? prev + 1 : prev - 1);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <button onClick={handleLike} className={`flex items-center gap-1 text-xs sm:text-sm font-medium transition-colors ${isLiked ? "text-red-500" : "dark:text-zinc-500 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}>
      <ThumbsUp size={14} className={isLiked ? "fill-red-500" : ""} />
      {likeCount} {likeCount === 1 ? 'Upvote' : 'Upvotes'}
    </button>
  );
}

function ReplyInterface({ reviewId, currentUserId, commentCount }: { reviewId: string, currentUserId?: string, commentCount: number }) {
  const router = useRouter();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, content: replyText }),
      });

      if (res.ok) {
        setIsReplying(false);
        setReplyText("");
        router.refresh();
      } else {
        alert("Failed to post reply.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 flex-1 min-w-0">
      <button onClick={() => { if (!currentUserId) return alert("You must be signed in to reply."); setIsReplying(!isReplying); }} className="flex items-center gap-1 text-xs sm:text-sm font-medium dark:text-zinc-500 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors w-fit">
        <Reply size={14} />
        {commentCount} {commentCount === 1 ? 'Reply' : 'Replies'}
      </button>

      {isReplying && (
        <div className="flex flex-col sm:flex-row gap-2 animate-in fade-in slide-in-from-top-2 w-full mt-1">
          <input type="text" autoFocus value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply..." className="flex-1 min-w-0 w-full dark:bg-zinc-950 bg-white border dark:border-zinc-800 border-gray-300 rounded-md px-3 py-1.5 text-xs sm:text-sm dark:text-white text-zinc-900 focus:outline-none focus:border-red-500 dark:focus:border-zinc-600 transition-colors"/>
          <button onClick={handleReplySubmit} disabled={isSubmitting || !replyText.trim()} className="dark:bg-zinc-200 bg-zinc-900 dark:hover:bg-white hover:bg-zinc-800 dark:text-zinc-900 text-white px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 w-full sm:w-auto flex-shrink-0">
            {isSubmitting ? "..." : "Post"}
          </button>
        </div>
      )}
    </div>
  );
}