import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Friendly bots (like Google) are allowed, but must wait 10 seconds between clicks
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/', 
          '/admin/', 
          '/login', 
          '/register'
        ],
        crawlDelay: 10, 
      },
      {
        // Aggressive SEO scrapers and AI bots get completely blocked
        userAgent: ['AhrefsBot', 'SemrushBot', 'DotBot', 'PetalBot', 'ClaudeBot', 'GPTBot', 'Barkrowler'],
        disallow: ['/'],
      }
    ],
    sitemap: 'https://themoviespace.vercel.app/sitemap.xml',
  }
}