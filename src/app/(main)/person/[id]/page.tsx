import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, PlayCircle, MapPin, Calendar, User, Film } from "lucide-react";

export const revalidate = 60; // Updates the cache every 60 seconds
export const dynamic = "force-dynamic";

async function getActorDetails(personId: string) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/person/${personId}?api_key=${process.env.TMDB_API_KEY}&append_to_response=movie_credits`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const person = await getActorDetails(resolvedParams.id);

  if (!person) notFound();

  const knownFor = person.movie_credits?.cast
    ?.filter((movie: any) => movie.poster_path) 
    ?.sort((a: any, b: any) => b.popularity - a.popularity)
    || [];

  const calculateAge = (birthday: string, deathday: string | null) => {
    const birthDate = new Date(birthday);
    const endDate = deathday ? new Date(deathday) : new Date();
    let age = endDate.getFullYear() - birthDate.getFullYear();
    const m = endDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen dark:bg-zinc-950 bg-gray-50 pb-20 pt-24 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10 md:gap-16">
        
        {/* ================= LEFT SIDEBAR (Photo & Info) ================= */}
        <aside className="w-full md:w-[300px] flex-shrink-0">
          <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] border dark:border-zinc-800 border-gray-200 dark:bg-zinc-900 bg-white mb-8 transition-colors">
            {person.profile_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                alt={person.name}
                fill
                priority
                sizes="300px"
                className="object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full dark:text-zinc-600 text-zinc-400">
                <User size={64} className="mb-4 opacity-50" />
                <span className="font-medium text-sm">No Photo</span>
              </div>
            )}
          </div>

          <div className="dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-gray-200 shadow-sm rounded-2xl p-6 transition-colors">
            <h3 className="text-lg font-bold dark:text-white text-zinc-900 mb-4 border-b dark:border-zinc-800 border-gray-100 pb-2 transition-colors">Personal Info</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <p className="dark:text-zinc-500 text-zinc-500 font-bold uppercase tracking-wider text-[10px] mb-1">Known For</p>
                <p className="dark:text-zinc-300 text-zinc-700 font-medium">{person.known_for_department}</p>
              </div>

              {person.birthday && (
                <div>
                  <p className="dark:text-zinc-500 text-zinc-500 font-bold uppercase tracking-wider text-[10px] mb-1">Born</p>
                  <p className="dark:text-zinc-300 text-zinc-700 font-medium flex items-center gap-2">
                    <Calendar size={14} className="text-red-500" />
                    {new Date(person.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    {!person.deathday && <span className="dark:text-zinc-500 text-zinc-400">({calculateAge(person.birthday, null)} years old)</span>}
                  </p>
                </div>
              )}

              {person.deathday && (
                <div>
                  <p className="dark:text-zinc-500 text-zinc-500 font-bold uppercase tracking-wider text-[10px] mb-1">Died</p>
                  <p className="dark:text-zinc-300 text-zinc-700 font-medium flex items-center gap-2">
                    <Calendar size={14} className="dark:text-zinc-500 text-zinc-400" />
                    {new Date(person.deathday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    <span className="dark:text-zinc-500 text-zinc-400">(Age {calculateAge(person.birthday, person.deathday)})</span>
                  </p>
                </div>
              )}

              {person.place_of_birth && (
                <div>
                  <p className="dark:text-zinc-500 text-zinc-500 font-bold uppercase tracking-wider text-[10px] mb-1">Place of Birth</p>
                  <p className="dark:text-zinc-300 text-zinc-700 font-medium flex items-start gap-2">
                    <MapPin size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                    {person.place_of_birth}
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ================= RIGHT MAIN CONTENT ================= */}
        <main className="flex-1">
          <h1 className="text-5xl md:text-7xl font-black dark:text-white text-zinc-900 tracking-tight mb-8 transition-colors">
            {person.name}
          </h1>

          {/* Biography */}
          {person.biography && (
            <div className="mb-16">
              <h2 className="text-xl font-bold dark:text-white text-zinc-900 mb-4 flex items-center gap-2 transition-colors">
                <User size={20} className="text-red-500" /> Biography
              </h2>
              <div className="dark:text-zinc-300 text-zinc-700 text-lg leading-relaxed font-medium whitespace-pre-wrap transition-colors">
                {person.biography.length > 1000 
                  ? `${person.biography.substring(0, 1000)}...` 
                  : person.biography}
              </div>
            </div>
          )}

          {/* Known For Grid */}
          <div>
            <div className="flex items-end justify-between mb-8 pb-4 border-b dark:border-zinc-800/50 border-gray-200 transition-colors">
              <h2 className="text-2xl font-bold dark:text-white text-zinc-900 flex items-center gap-2 transition-colors">
                <Film size={24} className="text-red-500" /> Known For
              </h2>
              <span className="text-sm font-bold dark:text-zinc-500 text-zinc-500">{knownFor.length} Credits</span>
            </div>

            {knownFor.length === 0 ? (
              <p className="dark:text-zinc-500 text-zinc-500">No movie credits found for this person.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                {knownFor.map((movie: any) => (
                  <Link href={`/movie/${movie.id}`} key={`${movie.id}-${movie.character}`} className="group flex flex-col gap-3">
                    <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden dark:bg-zinc-900 bg-gray-200 border dark:border-zinc-800 border-gray-300 shadow-lg transition-all duration-300 group-hover:-translate-y-2 dark:group-hover:shadow-[0_10px_30px_rgba(220,38,38,0.25)] group-hover:shadow-[0_10px_30px_rgba(220,38,38,0.15)] dark:group-hover:border-zinc-600 group-hover:border-zinc-400">
                      <Image 
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                        alt={movie.title} 
                        fill 
                        sizes="(max-width: 640px) 50vw, 20vw" 
                        className="object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <PlayCircle size={48} className="text-white/90 drop-shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300" />
                      </div>
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 flex items-center gap-1.5 shadow-lg">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        <span className="text-white text-xs font-bold">{movie.vote_average?.toFixed(1)}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="dark:text-white text-zinc-900 font-bold text-sm truncate group-hover:text-red-600 transition-colors">{movie.title}</h3>
                      {movie.character && (
                        <p className="dark:text-zinc-500 text-zinc-500 text-xs mt-0.5 truncate font-medium">as {movie.character}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}