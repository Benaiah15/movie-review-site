"use client";

import { Trash2, Edit3, Loader2 } from "lucide-react";
import { useState } from "react";

export default function MovieRowActions({ movieId, movieTitle }: { movieId: string, movieTitle: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // 1. Confirm before deleting to prevent accidents
    if (!confirm(`Are you sure you want to delete "${movieTitle}"?`)) return;

    setIsDeleting(true);
    try {
      // 2. Call the delete API we created earlier
      const res = await fetch(`/api/movies/${movieId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // 3. Refresh the page to show the updated table
        window.location.reload();
      } else {
        alert("Failed to delete movie. Please try again.");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Delete error:", error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all" 
        title="Edit"
      >
        <Edit3 size={18} />
      </button>
      
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50" 
        title="Delete"
      >
        {isDeleting ? <Loader2 size={18} className="animate-spin text-red-500" /> : <Trash2 size={18} />}
      </button>
    </div>
  );
}