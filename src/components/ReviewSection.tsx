"use client";

import { useState } from "react";
import { Star, MessageSquare, Loader2, UserCircle, ThumbsUp, Reply } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: { id: string; name: string | null; image: string | null; };
}

interface Review {
  id: string;
  rating: number;
  content: string;
  createdAt: Date;
  user: { id: string; name: string | null; image: string | null; };
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
    <div className="pt-8 mt-12 border-t dark:border-zinc-800 border-gray-200 transition-colors">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold dark:text-white text-zinc-900 flex items-center gap-3 transition-colors">
          <MessageSquare className="text-red-600" />
          Community Reviews
        </h3>
        
        {session ? (
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold tracking-wide rounded-lg transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]"
          >
            {isFormOpen ? "Cancel Review" : "+ Write a Review"}
          </button>
        ) : null}
      </div>

      {!session && (
        <div className="dark:bg-zinc-900/50 bg-gray-50 border dark:border-zinc-800 border-gray-200 rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
          <p className="dark:text-zinc-400 text-zinc-600 transition-colors">Join the community to share your thoughts on this movie.</p>
          <Link href="/login" className="px-6 py-2 dark:bg-white bg-zinc-900 dark:text-black text-white font-bold rounded-lg dark:hover:bg-zinc-200 hover:bg-zinc-800 transition whitespace-nowrap">
            Sign In to Review
          </Link>
        </div>
      )}

      {isFormOpen && session && (
        <form onSubmit={handleSubmit} className="dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-gray-200 rounded-xl p-6 mb-8 animate-in slide-in-from-top-4 fade-in duration-300 transition-colors shadow-sm">
          <div className="mb-6">
            <label className="block text-sm font-semibold dark:text-zinc-400 text-zinc-700 mb-2 transition-colors">Your Rating (1-10)</label>
            <div className="flex items-center gap-2">
              <input type="range" min="1" max="10" value={rating} onChange={(e) => setRating(parseInt(e.target.value))} className="w-full max-w-xs accent-red-600"/>
              <div className="flex items-center gap-1 dark:bg-zinc-950 bg-gray-50 px-3 py-1.5 rounded-lg border dark:border-zinc-800 border-gray-200 transition-colors">
                <Star size={16} className="text-amber-500 fill-amber-500" />
                <span className="dark:text-white text-zinc-900 font-bold transition-colors">{rating}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold dark:text-zinc-400 text-zinc-700 mb-2 transition-colors">Your Thoughts</label>
            <textarea required rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder="What did you think of the movie?" className="w-full px-4 py-3 dark:bg-zinc-950 bg-gray-50 border dark:border-zinc-800 border-gray-300 rounded-lg dark:text-white text-zinc-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none"/>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 dark:bg-white bg-zinc-900 dark:text-black text-white font-bold rounded-lg dark:hover:bg-zinc-200 hover:bg-zinc-800 transition disabled:opacity-50 flex items-center gap-2 shadow-sm">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? "Publishing..." : "Publish Review"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="dark:bg-zinc-900/30 bg-white border dark:border-zinc-800/50 border-gray-300 rounded-xl p-12 text-center border-dashed transition-colors">
            <p className="dark:text-zinc-500 text-zinc-500 mb-2 transition-colors">No reviews yet.</p>
            <p className="text-sm dark:text-zinc-600 text-zinc-400 transition-colors">Be the first to share your thoughts!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-gray-200 rounded-xl p-6 shadow-sm transition-colors">
              
              <div className="flex items-center justify-between mb-4">
                {/* Clickable User Profile Link */}
                <Link href={`/user/${review.user.id}`} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 dark:bg-zinc-800 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-red-500 transition-colors">
                    {review.user.image ? (
                      <img src={review.user.image} alt={review.user.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle size={24} className="dark:text-zinc-500 text-zinc-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold dark:text-white text-zinc-900 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">{review.user.name || "Anonymous"}</p>
                    <p className="text-xs dark:text-zinc-500 text-zinc-500 transition-colors">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-1 dark:bg-amber-500/10 bg-amber-50 border dark:border-amber-500/20 border-amber-200 px-2.5 py-1 rounded-md transition-colors">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span className="text-amber-600 dark:text-amber-500 font-bold text-sm">{review.rating}</span>
                </div>
              </div>
              
              <p className="dark:text-zinc-300 text-zinc-700 leading-relaxed whitespace-pre-wrap mb-4 transition-colors">{review.content}</p>
              
              <div className="flex items-center gap-6 pt-4 border-t dark:border-zinc-800/50 border-gray-100 transition-colors">
                <LikeButton reviewId={review.id} initialLikes={review.likes} currentUserId={currentUserId} />
                <ReplyInterface reviewId={review.id} currentUserId={currentUserId} commentCount={review.comments.length} />
              </div>

              {review.comments.length > 0 && (
                <div className="mt-6 pl-6 ml-4 border-l-2 dark:border-zinc-800 border-gray-200 space-y-4 transition-colors">
                  {review.comments.map((comment) => (
                    <div key={comment.id} className="dark:bg-zinc-950/50 bg-gray-50 rounded-lg p-4 border dark:border-zinc-800/50 border-gray-200 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Link href={`/user/${comment.user.id}`} className="flex items-center gap-2 group">
                          {comment.user.image ? (
                            <img src={comment.user.image} alt="" className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <UserCircle size={16} className="dark:text-zinc-500 text-zinc-400" />
                          )}
                          <span className="font-medium text-sm dark:text-zinc-300 text-zinc-700 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">{comment.user.name || "Anonymous"}</span>
                        </Link>
                        <span className="text-xs dark:text-zinc-600 text-zinc-500 transition-colors">• {new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm dark:text-zinc-400 text-zinc-600 transition-colors">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
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
    <button onClick={handleLike} className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isLiked ? "text-red-500" : "dark:text-zinc-500 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}>
      <ThumbsUp size={16} className={isLiked ? "fill-red-500" : ""} />
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
    <div className="flex flex-col gap-3 flex-1">
      <button onClick={() => { if (!currentUserId) return alert("You must be signed in to reply."); setIsReplying(!isReplying); }} className="flex items-center gap-1.5 text-sm font-medium dark:text-zinc-500 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors w-fit">
        <Reply size={16} />
        {commentCount} {commentCount === 1 ? 'Reply' : 'Replies'}
      </button>

      {isReplying && (
        <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
          <input type="text" autoFocus value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply..." className="flex-1 dark:bg-zinc-950 bg-white border dark:border-zinc-800 border-gray-300 rounded-md px-3 py-2 text-sm dark:text-white text-zinc-900 focus:outline-none focus:border-red-500 dark:focus:border-zinc-600 transition-colors"/>
          <button onClick={handleReplySubmit} disabled={isSubmitting || !replyText.trim()} className="dark:bg-zinc-200 bg-zinc-900 dark:hover:bg-white hover:bg-zinc-800 dark:text-zinc-900 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50">
            {isSubmitting ? "..." : "Post"}
          </button>
        </div>
      )}
    </div>
  );
}