import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // TELL THE BOTS TO STAY OUT OF YOUR BACKEND
      disallow: [
        '/api/', 
        '/admin/', 
        '/login', 
        '/register'
      ], 
    },
    sitemap: 'https://themoviespace.vercel.app/sitemap.xml',
  }
}