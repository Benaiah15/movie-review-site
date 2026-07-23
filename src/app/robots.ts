import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Friendly bots (like Google) are allowed everywhere except private/heavy routes
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/login/',
          '/register',
          '/profile/',     // Added to protect DB from bots crawling user profiles
          '/collection/',  // Added to protect DB from bots crawling collections
          '/search'        // Added to prevent bots from triggering search queries
        ],
      },
      {
        // Aggressive SEO scrapers and AI bots get completely blocked
        userAgent: ['AhrefsBot', 'SemrushBot', 'DotBot', 'PetalBot', 'ClaudeBot', 'GPTBot', 'Barkrowler'],
        disallow: ['/'],
      }
    ],
    // Updated to your new Vercel domain
    sitemap: 'https://themoviespace.vercel.app/sitemap.xml',
  }
}