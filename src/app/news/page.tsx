import Image from "next/image";
import Link from "next/link";
import { Calendar, Newspaper, ExternalLink } from "lucide-react";

export const revalidate = 3600; // CRITICAL: Only fetches new articles once per hour to save API limits!

async function getMovieNews() {
  try {
    // Search for "movies OR hollywood" in english
    const res = await fetch(
      `https://gnews.io/api/v4/search?q=movies%20OR%20hollywood&lang=en&max=10&apikey=${process.env.GNEWS_API_KEY}`,
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

export default async function NewsPage() {
  const articles = await getMovieNews();

  return (
    <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pt-24 pb-20 px-4 md:px-8 transition-colors duration-300 overflow-x-hidden">
      <div className="max-w-5xl mx-auto w-full">
        
        <div className="flex items-center gap-3 mb-10 w-full">
          <div className="w-1.5 h-8 bg-red-600 rounded-sm flex-shrink-0"></div>
          <h1 className="text-3xl md:text-5xl font-black dark:text-white text-zinc-900 tracking-tight transition-colors truncate">
            Latest Industry News
          </h1>
        </div>

        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed dark:border-zinc-800 border-gray-300 rounded-2xl w-full">
            <Newspaper size={48} className="dark:text-zinc-700 text-zinc-300 mb-4" />
            <p className="dark:text-zinc-400 text-zinc-600 font-medium">Unable to fetch the latest news right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
            {articles.map((article: any, index: number) => (
              // Note: We use an external anchor tag <a> because these go to real news websites
              <a href={article.url} target="_blank" rel="noopener noreferrer" key={index} className="group flex flex-col dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all w-full">
                
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
      </div>
    </div>
  );
}