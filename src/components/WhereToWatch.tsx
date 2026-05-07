import Image from "next/image";

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface WatchProvidersProps {
  movieTitle: string;
  providers: {
    flatrate?: Provider[]; // Streaming (Netflix, Hulu)
    rent?: Provider[];     // Rent (Amazon, Apple)
    buy?: Provider[];      // Buy (Amazon, Apple)
  };
}

export default function WhereToWatch({ movieTitle, providers }: WatchProvidersProps) {
  if (!providers || (!providers.flatrate && !providers.rent && !providers.buy)) {
    return null; // Don't show the section if no data is available
  }

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
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">{title}</h4>
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
              <Image
                src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                alt={provider.provider_name}
                width={48}
                height={48}
                className="rounded-xl shadow-md border border-gray-700 group-hover:border-blue-500 transition-colors"
              />
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 my-8">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Where to Watch
      </h3>
      
      {renderProviderRow("Stream", providers.flatrate)}
      {renderProviderRow("Rent", providers.rent)}
      {renderProviderRow("Buy", providers.buy)}
      
      <p className="text-xs text-gray-500 mt-4 text-right">
        Data provided by JustWatch
      </p>
    </div>
  );
}