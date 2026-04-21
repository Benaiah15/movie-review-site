import { ChevronRight, FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service | MovieSpace",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 min-h-[65vh] animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-12 border-b dark:border-zinc-800 border-gray-200 pb-8 transition-colors">
        <div className="w-12 h-12 dark:bg-zinc-900 bg-gray-100 rounded-xl flex items-center justify-center mb-6 border dark:border-zinc-800 border-gray-200 shadow-sm transition-colors">
           <FileText className="text-red-600" size={24} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black dark:text-white text-zinc-900 mb-4 tracking-tight transition-colors">
          Terms of Service
        </h1>
        <p className="text-lg dark:text-zinc-400 text-zinc-600 font-medium transition-colors">
          The rules and guidelines for using MovieSpace.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-10 dark:text-zinc-300 text-zinc-700 leading-relaxed transition-colors">
        
        <section className="space-y-4">
          <h2 className="text-2xl font-bold dark:text-white text-zinc-900 transition-colors">1. Acceptance of Terms</h2>
          <p>
            By accessing and using MovieSpace, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use our service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold dark:text-white text-zinc-900 transition-colors">2. User Conduct</h2>
          <p>
            MovieSpace is a community built on respect. Users agree not to post abusive, discriminatory, or highly offensive content. We reserve the right to remove any content or suspend accounts that violate our community guidelines or terms of use.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold dark:text-white text-zinc-900 transition-colors">3. Content Ownership</h2>
          <p>
            You retain ownership of the reviews and comments you post on MovieSpace. By posting content, you grant MovieSpace a non-exclusive, royalty-free license to use, display, and distribute your content across the platform. Movie data and posters are provided by TMDB.
          </p>
        </section>
        
        <section className="space-y-4 dark:bg-zinc-900/50 bg-gray-50 p-6 rounded-2xl border dark:border-zinc-800 border-gray-200 transition-colors mt-12">
          <h2 className="text-xl font-bold dark:text-white text-zinc-900 transition-colors">Legal Contact</h2>
          <p className="text-sm dark:text-zinc-400 text-zinc-600">If you have any questions regarding our terms of service, please contact us.</p>
          <a href="mailto:legal@moviespace.com" className="inline-flex items-center gap-1 mt-2 text-red-600 dark:text-red-500 font-bold hover:underline transition-colors">
            legal@moviespace.com <ChevronRight size={16} />
          </a>
        </section>

      </div>
    </div>
  );
}