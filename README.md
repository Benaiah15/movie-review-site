# 🎬 MovieSpace 

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

MovieSpace is a high-performance, full-stack movie discovery and social networking platform. Built to handle massive datasets and dynamic user interactions, the platform allows users to explore global cinema, curate custom watchlists, write reviews, follow other cinephiles, and seamlessly stream or purchase titles.

## 🚀 Live Demo
**[themoviespace.vercel.app]**

## ✨ Core Features

* **Comprehensive Discovery:** Real-time fetching of trending movies, detailed cast lists, trailers, and similar movie recommendations using the TMDB API.
* **Social Ecosystem:** Users can write reviews, upvote community opinions, build custom collections, and follow other users to curate their feeds.
* **Gamification:** Dynamic leveling and badging system based on user engagement and review activity.
* **Global Monetization:** Integrated with JustWatch for accurate streaming availability and custom Amazon Associates routing for global affiliate revenue.
* **Responsive UI:** Fully mobile-optimized, dark-mode native interface built with Tailwind CSS and Lucide React icons.

## 🛠 Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Database Management:** Prisma ORM
* **Authentication:** NextAuth.js
* **External APIs:** TMDB (The Movie Database), JustWatch, GNews
* **Hosting/Deployment:** Vercel

## 🧠 System Architecture & Engineering Decisions

This project was built with a heavy focus on scalability and overcoming restrictive cloud provider limits. 

### 1. Bypassing Serverless Constraints
Initially deployed on Vercel, the application encountered aggressive automated bot crawls that exhausted free-tier serverless execution and database read limits. The infrastructure was successfully migrated to **Render** to ensure stable, always-on backend performance without unexpected usage blocks.

### 2. Custom ISR & Cache Optimization
To protect the database from excessive querying and to avoid hitting external API rate limits, a custom Incremental Static Regeneration (ISR) strategy was implemented. High-traffic components (like the global feed and trending pages) are aggressively cached, reducing API overhead by over 80% while keeping data fresh for users.

### 3. "Ghost" Database Writes (Bot Protection)
To prevent malicious bots from filling the database with empty records when scraping dynamic TMDB movie routes, a custom middleware check was built. The system intercepts the request, verifies if a valid `next-auth` user session exists, and only executes a database `create` operation for real human users. Bots receive perfectly formatted SEO mock-data, keeping the database footprint at 0 bytes for non-human traffic.

### 4. Dynamic Affiliate Routing
The "Where to Watch" component dynamically parses streaming provider data and intercepts Amazon pathways, dynamically injecting secure, region-compliant Amazon Associates affiliate tags (W-8BEN compliant for international operation). 

## 💻 Local Installation

To run MovieSpace locally, follow these steps:

1. **Clone the repository:**
```bash
   git clone [https://github.com/Benaiah15/movie-review-site.git]
   cd movie-review-site