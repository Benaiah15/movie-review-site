import { MetadataRoute } from 'next';
import db from "@/lib/db";

// Cache this sitemap for 24 hours (86400 seconds) so bots don't spam your DB
export const revalidate = 86400; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Updated to the live Vercel domain
  const baseUrl = "https://themoviespace.vercel.app";

  // 1. Static Routes
  const routes = ['', '/movies', '/news', '/login', '/register'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Dynamic Routes: Get active movies
  const activeMovies = await db.movie.findMany({
    select: { tmdbId: true, updatedAt: true },
    where: { OR: [{ reviews: { some: {} } }, { collections: { some: {} } }] },
    take: 1000, 
  });

  const movieUrls = activeMovies.map((movie) => ({
    // Changed '/movies/' to '/movie/' to match your actual route
    url: `${baseUrl}/movie/${movie.tmdbId}`,
    lastModified: movie.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...routes, ...movieUrls];
}