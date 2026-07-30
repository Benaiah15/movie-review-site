// src/app/sitemap/page.tsx
import Link from 'next/link';
import db from '@/lib/db';

// Cache this page for 24 hours just like your XML sitemap so bots don't spam the DB
export const revalidate = 86400;

export const metadata = {
  title: 'HTML Sitemap | MovieSpace',
  description: 'A complete directory of all movies and pages on MovieSpace.',
};

export default async function HTMLSitemap() {
  // Fetch the exact same active movies you used in your XML sitemap
  const activeMovies = await db.movie.findMany({
    select: { tmdbId: true },
    where: { 
      OR: [ 
        { reviews: { some: {} } }, 
        { collections: { some: {} } } 
      ] 
    },
    take: 1000,
  });

  return (
    <main className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8">MovieSpace Directory</h1>
      
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-700">Main Pages</h2>
        <ul className="space-y-2">
          <li><Link href="/" className="text-blue-500 hover:underline">Home</Link></li>
          <li><Link href="/movies" className="text-blue-500 hover:underline">Movies</Link></li>
          <li><Link href="/news" className="text-blue-500 hover:underline">News</Link></li>
          <li><Link href="/login" className="text-blue-500 hover:underline">Login</Link></li>
          <li><Link href="/register" className="text-blue-500 hover:underline">Register</Link></li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-700">Movie Database</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {activeMovies.map((movie) => (
            <li key={movie.tmdbId}>
              <Link 
                href={`/movie/${movie.tmdbId}`} 
                className="text-blue-500 hover:underline"
              >
                Movie #{movie.tmdbId}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}