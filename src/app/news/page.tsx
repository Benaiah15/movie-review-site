import Image from "next/image";
import Link from "next/link";
import { Calendar, Newspaper, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

export const revalidate = 3600; // Caches for 1 hour

// Updated to accept a page number for pagination
async function getMovieNews(page: number) {
  try {
    const res = await fetch(
      `https://gnews.io/api/v4/search?q=movies%20OR%20hollywood&lang=en&max=10&page=${page}&apikey=${process.env.GNEWS_API_KEY}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.articles || [];
  } catch (error) {
    console.error("News fetch failed:", error);
    return [];
  }
}

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const resolvedParams = await searchParams;
  // Grab the current page from the URL (e.g., /news?page=2), default to 1
  const currentPage = Number(resolvedParams.page) || 1;
  const articles = await getMovieNews(currentPage);

  return (
    <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pb-20 overflow-x-hidden transition-colors duration-300">
      
      {/* ================= CUSTOM HERO SECTION ================= */}
      <div className="w-full bg-red-600 dark:bg-red-900 pt-32 pb-24 px-6 text-center relative overflow-hidden">
        {/* Subtle background overlay */}
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-md">
            Industry News
          </h1>
          <p className="text-red-100 text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow-sm">
            The latest updates, casting announcements, and box office breakdowns from Hollywood and beyond.
          </p>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      {/* Negative margin pulls the cards up over the hero banner slightly for a premium look */}
      <div className="max-w-5xl mx-auto w-full px-4 md:px-8 -mt-10 relative z-20">

        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 border-2 border-dashed dark:border-zinc-800 border-gray-300 rounded-2xl w-full shadow-lg">
            <Newspaper size={48} className="dark:text-zinc-700 text-zinc-300 mb-4" />
            <p className="dark:text-zinc-400 text-zinc-600 font-medium">Unable to fetch the latest news right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
            {articles.map((article: any, index: number) => (
              <a href={article.url} target="_blank" rel="noopener noreferrer" key={index} className="group flex flex-col dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all w-full transform hover:-translate-y-1">
                
                <div className="relative aspect-video w-full dark:bg-zinc-800 bg-gray-200 overflow-hidden">
                  {article.image ? (
                    <Image src={article.image} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full"><Newspaper className="dark:text-zinc-600 text-zinc-400 opacity-50" size={40} /></div>
                  )}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                     <ExternalLink size={16} className="text-white" />
                  </div>
                </div>

                <div className="p-5 md:p-6 flex flex-col flex-1 min-w-0 w-full">
                  <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">{article.source.name}</div>
                  <h2 className="text-xl font-bold dark:text-white text-zinc-900 mb-2 group-hover:text-red-500 transition-colors break-words w-full line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="dark:text-zinc-400 text-zinc-600 text-sm mb-4 line-clamp-3 break-words w-full flex-1">
                    {article.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t dark:border-zinc-800/50 border-gray-100 w-full">
                    <div className="flex items-center gap-1.5 text-xs dark:text-zinc-500 text-zinc-500">
                      <Calendar size={12} />
                      {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* ================= PAGINATION UI ================= */}
        {articles.length > 0 && (
          <div className="mt-16 flex items-center justify-center gap-4 w-full">
            {currentPage > 1 ? (
              <Link href={`/news?page=${currentPage - 1}`} className="flex items-center gap-2 px-4 py-2.5 dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-gray-300 rounded-lg dark:text-white text-zinc-900 font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-sm">
                <ChevronLeft size={18} /> Prev
              </Link>
            ) : (
              <button disabled className="flex items-center gap-2 px-4 py-2.5 dark:bg-zinc-900/50 bg-gray-100 border dark:border-zinc-800/50 border-gray-200 rounded-lg dark:text-zinc-600 text-zinc-400 font-bold cursor-not-allowed">
                <ChevronLeft size={18} /> Prev
              </button>
            )}
            
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white font-black shadow-md">
              {currentPage}
            </div>
            
            {/* If we get fewer than 10 articles, we know we hit the last page */}
            {articles.length === 10 ? (
              <Link href={`/news?page=${currentPage + 1}`} className="flex items-center gap-2 px-4 py-2.5 dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-gray-300 rounded-lg dark:text-white text-zinc-900 font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-sm">
                Next <ChevronRight size={18} />
              </Link>
            ) : (
              <button disabled className="flex items-center gap-2 px-4 py-2.5 dark:bg-zinc-900/50 bg-gray-100 border dark:border-zinc-800/50 border-gray-200 rounded-lg dark:text-zinc-600 text-zinc-400 font-bold cursor-not-allowed">
                Next <ChevronRight size={18} />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}