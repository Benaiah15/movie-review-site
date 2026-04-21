import db from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function EditMoviePage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Await the params Promise (The Next.js fix)
  const resolvedParams = await params;

  // 2. Fetch the specific movie data using the resolved ID
  const movie = await db.movie.findUnique({
    where: { id: resolvedParams.id }
  });

  // If someone tries to edit a movie that doesn't exist, send them back
  if (!movie) {
    redirect("/admin/movies");
  }

  // Server Action to handle the form submission
  async function updateMovie(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const releaseDate = formData.get("releaseDate") as string;
    const rating = parseFloat(formData.get("rating") as string);

    await db.movie.update({
      where: { id: resolvedParams.id }, // Use the resolved ID here too
      data: { 
        title, 
        description, 
        releaseDate, 
        rating 
      }
    });

    // Refresh the table and send the user back to the dashboard
    revalidatePath("/admin/movies");
    redirect("/admin/movies");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Edit Movie</h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Make changes to the metadata for "{movie.title}".</p>
        </div>
        <Link 
          href="/admin/movies" 
          className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
        >
          Cancel
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-900 p-6 shadow-sm">
        <form action={updateMovie} className="space-y-6">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Movie Title</label>
            <input 
              type="text" 
              name="title" 
              defaultValue={movie.title} 
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Description / Overview</label>
            <textarea 
              name="description" 
              defaultValue={movie.description} 
              required
              rows={5}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Release Date</label>
              <input 
                type="text" 
                name="releaseDate" 
                defaultValue={movie.releaseDate || ""} 
                placeholder="YYYY-MM-DD"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Rating (0 - 10)</label>
              <input 
                type="number" 
                step="0.1"
                min="0"
                max="10"
                name="rating" 
                defaultValue={movie.rating} 
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-zinc-900">
            <button 
              type="submit" 
              className="w-full md:w-auto px-8 py-3 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
            >
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}