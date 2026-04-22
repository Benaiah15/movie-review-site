import Link from "next/link";
import { Calendar, Newspaper, ExternalLink } from "lucide-react";
import Pagination from "@/components/Pagination";

export const revalidate = 3600; // Caches for 1 hour

async function getMovieNews(page: number) {
  try {
    const res = await fetch(
      `https://gnews.io/api/v4/search?q=movies%20OR%20hollywood&lang=en&max=10&page=${page}&apikey=${process.env.GNEWS_API_KEY}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return { articles: [], totalPages: 1 };
    const data = await res.json();
    
    const calculatedPages = Math.ceil((data.totalArticles || 0) / 10);
    const totalPages = Math.min(calculatedPages, 10);
    
    return { articles: data.articles || [], totalPages: Math.max(totalPages, 1) };
  } catch (error) {
    console.error("News fetch failed:", error);
    return { articles: [], totalPages: 1 };
  }
}

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const { articles, totalPages } = await getMovieNews(currentPage);

  const heroImages = articles.filter((a: any) => a.image).slice(0, 10);

  return (
    <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pb-20 overflow-x-hidden transition-colors duration-300">
      
      {/* ================= BRIGHTER HERO SECTION ================= */}
      <div className="relative w-full h-[50vh] flex items-center justify-center border-b dark:border-zinc-800/50 border-gray-200 mb-12 overflow-hidden dark:bg-zinc-900 bg-gray-200 transition-colors duration-300">
        <div className="absolute inset-0 z-0 flex flex-wrap opacity-40">
          {heroImages.map((article: any, index: number) => (
            <div key={index} className="w-1/5 h-1/2 relative">
               {/* FIXED: Changed Next Image to standard img */}
               <img src={article.image} className="w-full h-full object-cover" alt="" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 dark:bg-gradient-to-t dark:from-zinc-950 dark:via-zinc-950/60 dark:to-zinc-950/30 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent z-10"></div>
        
        <div className="relative z-20 text-center px-6 max-w-3xl">
          <Newspaper className="text-red-600 mx-auto mb-6" size={56} />
          <h1 className="text-5xl md:text-7xl font-black dark:text-white text-zinc-900 tracking-tight mb-6 drop-shadow-2xl transition-colors">
            Industry News
          </h1>
          <p className="text-lg md:text-xl dark:text-white/90 text-zinc-700 font-medium drop-shadow-md transition-colors">
            The latest updates, casting announcements, and box office breakdowns from Hollywood and beyond.
          </p>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-5xl mx-auto w-full px-4 md:px-8 relative z-20">

        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 border-2 border-dashed dark:border-zinc-800 border-gray-300 rounded-2xl w-full shadow-lg transition-colors">
            <Newspaper size={48} className="dark:text-zinc-700 text-zinc-300 mb-4" />
            <p className="dark:text-zinc-400 text-zinc-600 font-medium">Unable to fetch the latest news right now.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
              {articles.map((article: any, index: number) => (
                <a href={article.url} target="_blank" rel="noopener noreferrer" key={index} className="group flex flex-col dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all w-full transform hover:-translate-y-1">
                  
                  <div className="relative aspect-video w-full dark:bg-zinc-800 bg-gray-200 overflow-hidden transition-colors">
                    {article.image ? (
                      {/* FIXED: Changed Next Image to standard img */}
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full"><Newspaper className="dark:text-zinc-600 text-zinc-400 opacity-50" size={40} /></div>
                    )}
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                       <ExternalLink size={16} className="text-white" />
                    </div>
                  </div>

                  <div className="p-5 md:p-6 flex flex-col flex-1 min-w-0 w-full transition-colors">
                    <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">{article.source.name}</div>
                    <h2 className="text-xl font-bold dark:text-white text-zinc-900 mb-2 group-hover:text-red-500 transition-colors break-words w-full line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="dark:text-zinc-400 text-zinc-600 text-sm mb-4 line-clamp-3 break-words w-full flex-1 transition-colors">
                      {article.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t dark:border-zinc-800/50 border-gray-100 w-full transition-colors">
                      <div className="flex items-center gap-1.5 text-xs dark:text-zinc-500 text-zinc-500 transition-colors">
                        <Calendar size={12} />
                        {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* ================= PAGINATION UI ================= */}
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              buildPageUrl={(page) => `/news?page=${page}`} 
            />
          </>
        )}

      </div>
    </div>
  );
}