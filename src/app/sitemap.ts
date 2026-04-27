import { MetadataRoute } from 'next';
import db from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://themoviespace.vercel.app";

  // 1. Static Routes
  const routes = ['', '/movies', '/news', '/login', '/register'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Dynamic Routes: Get movies that actually exist in your database (have reviews/saves)
  const activeMovies = await db.movie.findMany({
    select: { tmdbId: true, updatedAt: true },
    // Only grab movies that have at least one review or collection to save crawl budget
    where: { OR: [{ reviews: { some: {} } }, { collections: { some: {} } }] },
    take: 1000, // Google only needs the top active ones to start
  });

  const movieUrls = activeMovies.map((movie) => ({
    url: `${baseUrl}/movies/${movie.tmdbId}`,
    lastModified: movie.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...routes, ...movieUrls];
}