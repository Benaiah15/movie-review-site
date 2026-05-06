import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Friendly bots (like Google) are allowed everywhere except private routes
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/', 
          '/admin/', 
          '/login', 
          '/register'
        ],
      },
      {
        // Aggressive SEO scrapers and AI bots get completely blocked
        userAgent: ['AhrefsBot', 'SemrushBot', 'DotBot', 'PetalBot', 'ClaudeBot', 'GPTBot', 'Barkrowler'],
        disallow: ['/'],
      }
    ],
    sitemap: 'https://moviespace.onrender.com/sitemap.xml',
  }
}