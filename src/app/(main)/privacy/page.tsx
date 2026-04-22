import { ChevronRight, Shield } from "lucide-react";

export const revalidate = 60; // Updates the cache every 60 seconds
export const metadata = {
  title: "Privacy Policy | MovieSpace",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 min-h-[65vh] animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-12 border-b dark:border-zinc-800 border-gray-200 pb-8 transition-colors">
        <div className="w-12 h-12 dark:bg-zinc-900 bg-gray-100 rounded-xl flex items-center justify-center mb-6 border dark:border-zinc-800 border-gray-200 shadow-sm transition-colors">
           <Shield className="text-red-600" size={24} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black dark:text-white text-zinc-900 mb-4 tracking-tight transition-colors">
          Privacy Policy
        </h1>
        <p className="text-lg dark:text-zinc-400 text-zinc-600 font-medium transition-colors">
          How we protect and manage your data.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-10 dark:text-zinc-300 text-zinc-700 leading-relaxed transition-colors">
        
        <section className="space-y-4">
          <h2 className="text-2xl font-bold dark:text-white text-zinc-900 transition-colors">1. Information We Collect</h2>
          <p>
            When you register for a MovieSpace account, we collect basic information such as your name, email address, and authentication credentials. We also store the reviews, ratings, and comments you publicly post on the platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold dark:text-white text-zinc-900 transition-colors">2. How We Use Your Data</h2>
          <p>
            Your data is used solely to provide and improve the MovieSpace experience. This includes personalizing your feed, displaying your movie reviews to the community, and ensuring the security of your account. We do not sell your personal information to third parties.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold dark:text-white text-zinc-900 transition-colors">3. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your account information. However, please remember that no method of transmission over the internet or electronic storage is 100% secure.
          </p>
        </section>
        
        <section className="space-y-4 dark:bg-zinc-900/50 bg-gray-50 p-6 rounded-2xl border dark:border-zinc-800 border-gray-200 transition-colors mt-12">
          <h2 className="text-xl font-bold dark:text-white text-zinc-900 transition-colors">Privacy Inquiries</h2>
          <p className="text-sm dark:text-zinc-400 text-zinc-600">For questions regarding your data or to request account deletion, please contact our privacy team.</p>
          <a href="mailto:privacy@moviespace.com" className="inline-flex items-center gap-1 mt-2 text-red-600 dark:text-red-500 font-bold hover:underline transition-colors">
            privacy@moviespace.com <ChevronRight size={16} />
          </a>
        </section>

      </div>
    </div>
  );
}