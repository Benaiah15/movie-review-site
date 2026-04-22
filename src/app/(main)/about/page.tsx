import { ChevronRight, Film } from "lucide-react";

export const metadata = {
  title: "About Us | MovieSpace",
};

export const revalidate = 60; // Updates the cache every 60 seconds
export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 min-h-[65vh] animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-12 border-b dark:border-zinc-800 border-gray-200 pb-8 transition-colors">
        <div className="w-12 h-12 dark:bg-zinc-900 bg-gray-100 rounded-xl flex items-center justify-center mb-6 border dark:border-zinc-800 border-gray-200 shadow-sm transition-colors">
           <Film className="text-red-600" size={24} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black dark:text-white text-zinc-900 mb-4 tracking-tight transition-colors">
          About MovieSpace
        </h1>
        <p className="text-lg dark:text-zinc-400 text-zinc-600 font-medium transition-colors">
          Your digital diary for all things cinema.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-10 dark:text-zinc-300 text-zinc-700 leading-relaxed transition-colors">
        
        <section className="space-y-4">
          <h2 className="text-2xl font-bold dark:text-white text-zinc-900 transition-colors">Our Mission</h2>
          <p>
            MovieSpace was built for cinephiles, by cinephiles. We believe that tracking what you watch should be just as beautiful and engaging as the films themselves. We wanted to create a space free from clutter, focusing entirely on community, discussion, and discovery.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold dark:text-white text-zinc-900 transition-colors">The Platform</h2>
          <p>
            Whether you are keeping a private log of your weekend watches, writing in-depth reviews of timeless classics, or debating the latest box office hits with friends, MovieSpace gives you the tools to map your cinematic journey.
          </p>
        </section>
        
        <section className="space-y-4 dark:bg-zinc-900/50 bg-gray-50 p-6 rounded-2xl border dark:border-zinc-800 border-gray-200 transition-colors mt-12">
          <h2 className="text-xl font-bold dark:text-white text-zinc-900 transition-colors">Contact Us</h2>
          <p className="text-sm dark:text-zinc-400 text-zinc-600">Have questions, feedback, or want to report a bug? We are always listening.</p>
          <a href="mailto:support@moviespace.com" className="inline-flex items-center gap-1 mt-2 text-red-600 dark:text-red-500 font-bold hover:underline transition-colors">
            support@moviespace.com <ChevronRight size={16} />
          </a>
        </section>

      </div>
    </div>
  );
}