"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, PlayCircle, ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroSlideshow({ movies }: { movies: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!movies || movies.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 7000); 
    return () => clearInterval(timer);
  }, [movies]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % movies.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1));

  if (!movies || movies.length === 0) return null;

  const featuredMovie = movies[currentIndex];

  return (
    <div className="relative w-full h-[75vh] md:h-[90vh] flex items-center md:items-end pb-12 md:pb-24 z-0 group overflow-hidden dark:bg-zinc-950 bg-gray-50 transition-colors duration-300">
      
      {movies.map((movie, index) => (
        <div 
          key={movie.id} 
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
        >
          {movie.backdrop_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
              alt={movie.title}
              fill
              priority={index === 0}
              className="object-cover opacity-90 dark:opacity-80 transition-opacity duration-300"
            />
          ) : (
            <div className="w-full h-full dark:bg-zinc-900 bg-gray-200 transition-colors" />
          )}
        </div>
      ))}
      
      {/* PERFECT BLENDING GRADIENTS */}
      {/* Bottom fade: Blends into the page background */}
      <div className="absolute inset-0 bg-gradient-to-t dark:from-zinc-950 dark:via-zinc-950/60 from-gray-50 via-gray-50/60 to-transparent z-0 transition-colors duration-300" />
      {/* Left fade: Ensures text is readable over the image */}
      <div className="absolute inset-0 bg-gradient-to-r dark:from-zinc-950 dark:via-zinc-950/50 from-gray-50 via-gray-50/80 to-transparent z-0 transition-colors duration-300" />

      {/* Navigation Arrows */}
      <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 dark:bg-black/50 bg-white/50 backdrop-blur-sm dark:text-white text-zinc-900 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white dark:hover:bg-red-600 shadow-lg hover:scale-110">
        <ChevronLeft size={24} />
      </button>
      <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 dark:bg-black/50 bg-white/50 backdrop-blur-sm dark:text-white text-zinc-900 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white dark:hover:bg-red-600 shadow-lg hover:scale-110">
        <ChevronRight size={24} />
      </button>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full mt-20 md:mt-0">
        <div className="max-w-3xl animate-in slide-in-from-bottom-8 fade-in duration-700" key={featuredMovie.id}>
          
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-md uppercase tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              #{currentIndex + 1} Trending
            </span>
            <div className="flex items-center gap-1.5 dark:bg-black/60 bg-white/80 backdrop-blur-md border dark:border-white/20 border-gray-300 px-3 py-1.5 rounded-md shadow-lg transition-colors">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              <span className="dark:text-white text-zinc-900 text-xs font-bold transition-colors">{featuredMovie.vote_average?.toFixed(1)}</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black dark:text-white text-zinc-900 tracking-tighter mb-6 drop-shadow-2xl leading-tight transition-colors">
            {featuredMovie.title}
          </h1>
          
          <p className="text-lg md:text-xl dark:text-white/90 text-zinc-700 mb-10 line-clamp-3 leading-relaxed max-w-2xl font-medium drop-shadow-md transition-colors">
            {featuredMovie.overview}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href={`/movie/${featuredMovie.id}`}
              className="w-full sm:w-auto px-8 py-4 dark:bg-white bg-zinc-900 dark:text-black text-white font-black rounded-xl dark:hover:bg-zinc-200 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,0,0,0.2)] dark:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105"
            >
              <PlayCircle size={20} /> View Details & Reviews
            </Link>
            <Link 
              href="/movies"
              className="w-full sm:w-auto px-8 py-4 dark:bg-zinc-900/80 bg-white/80 backdrop-blur-md dark:text-white text-zinc-900 font-bold rounded-xl dark:hover:bg-zinc-800 hover:bg-gray-100 border dark:border-zinc-700 border-gray-300 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              Explore Catalog
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}