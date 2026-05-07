import Image from "next/image";

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface WatchProvidersProps {
  movieTitle: string;
  providers?: {
    flatrate?: Provider[]; // Streaming (Netflix, Hulu)
    rent?: Provider[];     // Rent (Amazon, Apple)
    buy?: Provider[];      // Buy (Amazon, Apple)
  } | null;
}

export default function WhereToWatch({ movieTitle, providers }: WatchProvidersProps) {
  // Safe fallback in case providers is null or undefined
  const safeProviders = providers || {};

  // THE MONEY MAKER: This function intercepts Amazon providers and injects your affiliate tag
  const generateAffiliateLink = (providerName: string) => {
    if (providerName.includes("Amazon")) {
      // Replace 'YOUR_AMAZON_TAG-20' with your actual Amazon Associates ID later
      const encodedTitle = encodeURIComponent(movieTitle);
      return `https://www.amazon.com/s?k=${encodedTitle}&i=instant-video&tag=moviespace-20`;
    }
    
    // For Netflix, Max, etc., we just send them to a Google search for the movie
    return `https://www.google.com/search?q=Watch+${encodeURIComponent(movieTitle)}+on+${encodeURIComponent(providerName)}`;
  };

  const renderProviderRow = (title: string, items?: Provider[]) => {
    return (
      <div className="mb-6 last:mb-0">
        <h4 className="text-sm font-bold dark:text-zinc-500 text-zinc-500 uppercase tracking-wider mb-3">
          {title}
        </h4>
        
        {/* If there are no items, show the "Not available" message */}
        {!items || items.length === 0 ? (
          <p className="text-sm dark:text-zinc-400 text-zinc-500 italic">
            Not available to {title.toLowerCase()} currently.
          </p>
        ) : (
          /* If there are items, show the logos */
          <div className="flex flex-wrap gap-3">
            {items.map((provider) => (
              <a
                key={provider.provider_id}
                href={generateAffiliateLink(provider.provider_name)}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative transition-transform hover:scale-105"
                title={`Watch on ${provider.provider_name}`}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md border dark:border-zinc-700 border-gray-300 group-hover:border-blue-500 dark:group-hover:border-blue-500 transition-colors">
                  <Image
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt={provider.provider_name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dark:bg-zinc-900/30 bg-white border dark:border-zinc-800/50 border-gray-200 p-5 sm:p-6 rounded-2xl shadow-sm transition-colors text-left w-full overflow-hidden my-8">
      <h3 className="text-lg sm:text-xl font-bold dark:text-white text-zinc-900 mb-6 flex items-center gap-2 transition-colors">
        <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Where to Watch
      </h3>
      
      <div className="flex flex-col gap-2">
        {renderProviderRow("Stream", safeProviders.flatrate)}
        <div className="w-full h-px dark:bg-zinc-800/50 bg-gray-200 my-1"></div>
        {renderProviderRow("Rent", safeProviders.rent)}
        <div className="w-full h-px dark:bg-zinc-800/50 bg-gray-200 my-1"></div>
        {renderProviderRow("Buy", safeProviders.buy)}
      </div>
      
      <p className="text-[10px] sm:text-xs dark:text-zinc-600 text-gray-400 mt-6 text-right font-medium uppercase tracking-wider">
        Data provided by JustWatch
      </p>
    </div>
  );
}