import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize the Redis database connection
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Create the rate limiter
// RULE: Allow 5 requests per 10 seconds per IP address
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
});

export async function middleware(request: NextRequest) {
  // Only apply rate limiting to routes that WRITE data (POST, PUT, PATCH, DELETE)
  // We don't want to limit GET requests (like reading reviews or browsing movies)
  if (request.method !== "GET") {
    
    // Get the user's IP address (Vercel provides this automatically)
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    
    // Check if they are exceeding the limit
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);
    
    if (!success) {
      console.warn(`[RATE LIMIT TRIGGERED] Blocked IP: ${ip}`);
      // Block the request and return a 429 Too Many Requests status
      return new NextResponse(
        JSON.stringify({ error: "You are doing that too fast. Please wait 10 seconds." }),
        { 
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          }
        }
      );
    }
  }

  // If they are safe, let the request pass through to your API
  return NextResponse.next();
}

// Tell Next.js exactly which paths this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all API routes except for webhooks or public read-only endpoints if needed.
     * We want to protect registration, reviews, comments, and auth.
     */
    "/api/:path*",
  ],
};