import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  buildPageUrl: (page: number) => string;
}

export default function Pagination({ currentPage, totalPages, buildPageUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Smart logic to generate the page numbers with "..." gaps
  const getVisiblePages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pages = getVisiblePages();

  return (
    <div className="mt-16 flex items-center justify-center gap-2 md:gap-3 w-full pb-8">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link 
          href={buildPageUrl(currentPage - 1)} 
          className="flex items-center gap-1 px-3 py-2 md:px-4 md:py-2.5 dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-gray-300 rounded-lg dark:text-white text-zinc-900 font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <ChevronLeft size={18} /> <span className="hidden sm:block">Prev</span>
        </Link>
      ) : (
        <button disabled className="flex items-center gap-1 px-3 py-2 md:px-4 md:py-2.5 dark:bg-zinc-900/50 bg-gray-100 border dark:border-zinc-800 border-gray-200 rounded-lg dark:text-zinc-600 text-zinc-400 font-bold cursor-not-allowed">
          <ChevronLeft size={18} /> <span className="hidden sm:block">Prev</span>
        </button>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {pages.map((page, index) => {
          if (page === '...') {
            return <span key={`ellipsis-${index}`} className="px-2 dark:text-zinc-500 text-zinc-400 font-bold">...</span>;
          }

          const isActive = page === currentPage;
          return (
            <Link 
              key={page} 
              href={buildPageUrl(page as number)}
              className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                isActive 
                  ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]" 
                  : "dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-gray-300 dark:text-zinc-300 text-zinc-700 hover:border-red-500 dark:hover:border-red-500"
              }`}
            >
              {page}
            </Link>
          );
        })}
      </div>
      
      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link 
          href={buildPageUrl(currentPage + 1)} 
          className="flex items-center gap-1 px-3 py-2 md:px-4 md:py-2.5 dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-gray-300 rounded-lg dark:text-white text-zinc-900 font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <span className="hidden sm:block">Next</span> <ChevronRight size={18} />
        </Link>
      ) : (
        <button disabled className="flex items-center gap-1 px-3 py-2 md:px-4 md:py-2.5 dark:bg-zinc-900/50 bg-gray-100 border dark:border-zinc-800 border-gray-200 rounded-lg dark:text-zinc-600 text-zinc-400 font-bold cursor-not-allowed">
          <span className="hidden sm:block">Next</span> <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}