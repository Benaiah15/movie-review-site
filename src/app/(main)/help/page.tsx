import { ChevronRight, LifeBuoy } from "lucide-react";

export const metadata = {
  title: "Help Center | MovieSpace",
};

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 min-h-[65vh] animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-12 border-b dark:border-zinc-800 border-gray-200 pb-8 transition-colors">
        <div className="w-12 h-12 dark:bg-zinc-900 bg-gray-100 rounded-xl flex items-center justify-center mb-6 border dark:border-zinc-800 border-gray-200 shadow-sm transition-colors">
           <LifeBuoy className="text-red-600" size={24} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black dark:text-white text-zinc-900 mb-4 tracking-tight transition-colors">
          Help Center
        </h1>
        <p className="text-lg dark:text-zinc-400 text-zinc-600 font-medium transition-colors">
          How can we assist you today?
        </p>
      </div>

      {/* Content */}
      <div className="space-y-10 dark:text-zinc-300 text-zinc-700 leading-relaxed transition-colors">
        
        <section className="space-y-4">
          <h2 className="text-2xl font-bold dark:text-white text-zinc-900 transition-colors">Managing Your Account</h2>
          <p>
            You can update your profile picture, change your display name, and manage your account settings directly from your Profile page. If you need to reset your password, please use the "Forgot Password" link on the login screen.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold dark:text-white text-zinc-900 transition-colors">Writing Reviews</h2>
          <p>
            To leave a review, simply navigate to any movie's detail page, scroll to the review section, and share your thoughts. You can edit or delete your reviews at any time from your personal feed.
          </p>
        </section>
        
        <section className="space-y-4 dark:bg-zinc-900/50 bg-gray-50 p-6 rounded-2xl border dark:border-zinc-800 border-gray-200 transition-colors mt-12">
          <h2 className="text-xl font-bold dark:text-white text-zinc-900 transition-colors">Still need help?</h2>
          <p className="text-sm dark:text-zinc-400 text-zinc-600">If you can't find the answer you're looking for, reach out to our support team.</p>
          <a href="mailto:support@moviespace.com" className="inline-flex items-center gap-1 mt-2 text-red-600 dark:text-red-500 font-bold hover:underline transition-colors">
            support@moviespace.com <ChevronRight size={16} />
          </a>
        </section>

      </div>
    </div>
  );
}